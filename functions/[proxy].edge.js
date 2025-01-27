export default async function handler(request) {
    // Fetch the original request response
    const response = await fetch(request);
  
    // Clone the original response to modify it
    let modifiedResponse = response.clone();
    const contentType = response.headers.get('content-type');
  
    // Only modify the response if it's HTML
    if (contentType && contentType.includes('text/html')) {
      let html = await response.text();
  
      // Insert the Lytics tracking code before the closing </head> tag
      const lyticsScript = `
        <!-- Start Lytics Tracking Tag Version 3 -->
        <script type="text/javascript">
        !function(){"use strict";var o=window.jstag||(window.jstag={}),r=[];function n(e){o[e]=function(){for(var n=arguments.length,t=new Array(n),i=0;i<n;i++)t[i]=arguments[i];r.push([e,t])}}n("send"),n("mock"),n("identify"),n("pageView"),n("unblock"),n("getid"),n("setid"),n("loadEntity"),n("getEntity"),n("on"),n("once"),n("call"),o.loadScript=function(n,t,i){var e=document.createElement("script");e.async=!0,e.src=n,e.onload=t,e.onerror=i;var o=document.getElementsByTagName("script")[0],r=o&&o.parentNode||document.head||document.body,c=o||r.lastChild;return null!=c?r.insertBefore(e,c):r.appendChild(e),this},o.init=function n(t){return this.config=t,this.loadScript(t.src,function(){if(o.init===n)throw new Error("Load error!");o.init(o.config),function(){for(var n=0;n<r.length;n++){var t=r[n][0],i=r[n][1];o[t].apply(o,i)}r=void 0}()}),this}}();
        jstag.init({
          src: 'https://c.lytics.io/api/tag/a84fef4e65fe894eecb707074a47c0f2/latest.min.js',
          pageAnalysis: {
            dataLayerPull: { disabled: true }
          }
        });
        jstag.pageView();
        </script>
        <!-- End Lytics Tracking Tag -->
      `;
  
      // Insert the Lytics script before the closing </head> tag
      html = html.replace('</head>', `${lyticsScript}</head>`);
  
      // Create a new response with the modified HTML
      modifiedResponse = new Response(html, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      });
    }
  
    return modifiedResponse;
  }
  