import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import { InstantSearch, Configure } from 'react-instantsearch-dom'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ClientProvider } from 'context/ClientContext'
import get from 'utils/get'
import Header from 'blocks/Header'
import Filters from 'blocks/Filters'
import MoviesList from 'blocks/MoviesList/index'
import { LANGUAGES } from 'data/constants'
import { LanguageProvider } from 'context/LanguageContext'
import useLocalStorage from 'hooks/useLocalStorage'
import DocumentIndexer from 'components/DocumentIndexer'

const MEILISEARCH_URL = process.env.MEILISEARCH_URL
const MEILISEARCH_SEARCH_KEY = process.env.MEILISEARCH_SEARCH_KEY

const Wrapper = styled.div`
  @media (min-width: ${get('breakpoints.desktop')}) {
    padding: 0 50px 50px;
  }
`

const Home = ({ host, apiKey }) => {
  const [localStorageCountry, setLocalStorageCountry] =
    useLocalStorage('country-preference')
  const { t } = useTranslation('common')
  const [client, setClient] = React.useState(null)
  const [selectedLanguage, setSelectedLanguage] = React.useState(null)
  const [hasDocuments, setHasDocuments] = React.useState(false)

  const setSelectedCountry = React.useCallback(
    country => {
      setSelectedLanguage(country)
      setLocalStorageCountry(country.code)
    },
    [setLocalStorageCountry]
  )

  React.useEffect(() => {
    const preferedLanguage = LANGUAGES.find(e => e.code === localStorageCountry)
    const defaultLanguage = LANGUAGES.find(e => e.code === 'en-US')
    setSelectedLanguage(preferedLanguage || defaultLanguage)
  }, [localStorageCountry])

  React.useEffect(() => {
    if (host && apiKey)
      setClient(
        instantMeiliSearch(host, apiKey, {
          primaryKey: 'id',
          paginationTotalHits: 24,
        })
      )
  }, [host, apiKey])

  React.useEffect(() => {
    fetch('/api/stats')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        data.result === 0 ? setHasDocuments(false) : setHasDocuments(true)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
      })
  }, [])

  if (!host || !apiKey) return <div>{t('connexionFailed')}</div>

  return (
    <ClientProvider value={{ client, setClient }}>
      <LanguageProvider
        value={{ selectedLanguage, setSelectedLanguage: setSelectedCountry }}
      >
        <Head>
          {/* Lytics Tracking Script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(){"use strict";var o=window.jstag||(window.jstag={}),r=[];function n(e){o[e]=function(){for(var n=arguments.length,t=new Array(n),i=0;i<n;i++)t[i]=arguments[i];r.push([e,t])}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("loadEntity"),n("getEntity"),n("on"),n("once"),n("call"),o.loadScript=function(n,t,i){var e=document.createElement("script");e.async=!0,e.src=n,e.onload=t,e.onerror=i;var o=document.getElementsByTagName("script")[0],r=o&&o.parentNode||document.head||document.body,c=o||r.lastChild;return null!=c?r.insertBefore(e,c):r.appendChild(e),this},o.init=function n(t){return this.config=t,this.loadScript(t.src,function(){if(o.init===n)throw new Error("Load error!");o.init(o.config),function(){for(var n=0;n<r.length;n++){var t=r[n][0],i=r[n][1];o[t].apply(o,i)}r=void 0}()}),this}}();
                jstag.init({
                  src: 'https://c.lytics.io/api/tag/a84fef4e65fe894eecb707074a47c0f2/latest.min.js',
                  pageAnalysis: {
                    dataLayerPull: { disabled: true }
                  }
                });
                jstag.pageView();
              `,
            }}
          />

          {/* Google Tag Manager */}
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-6JLS9M98HW"
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-6JLS9M98HW');
              `,
            }}
          />

          <title>{t('Meilisearch starter')}</title>
          <meta name="description" content={t('meta.description')} />
        </Head>
        {client &&
          (hasDocuments ? (
            <InstantSearch
              indexName={selectedLanguage.indexName}
              searchClient={client}
            >
              <Configure hitsPerPage={24} />
              <Wrapper>
                <Header />
                <Filters />
                <MoviesList />
              </Wrapper>
            </InstantSearch>
          ) : (
            <DocumentIndexer />
          ))}
      </LanguageProvider>
    </ClientProvider>
  )
}

export const getStaticProps = async ({ locale }) => {
  if (!MEILISEARCH_URL || !MEILISEARCH_SEARCH_KEY)
    throw new Error(
      'Missing Meilisearch host or API key. Check your application environment variables.'
    )

  return {
    props: {
      host: MEILISEARCH_URL,
      apiKey: MEILISEARCH_SEARCH_KEY,
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default Home
