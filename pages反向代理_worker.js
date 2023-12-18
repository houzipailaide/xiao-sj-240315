// copyright https://t.me/edtunnel

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

export default {
  async fetch(request, env) {
    let url = new URL(request.url);

    let urlsStr = url.pathname.startsWith('/proxy/') ? url.pathname.replace("/proxy/","") : url.pathname.replace("/tproxy/","")
    let urls = urlsStr.split(',');

    shuffleArray(urls);

    const domain = url.searchParams.get('domain');

    if (url.pathname.startsWith('/proxy/') || url.pathname.startsWith('/tproxy/')) {
      for(let actualUrlStr of urls){
        let actualUrl = new URL(actualUrlStr);

        let modifiedRequest = new Request(actualUrl, {
          headers: request.headers,
          method: request.method,
          body: request.body,
          redirect: 'follow'
        });

        if (domain) {
          modifiedRequest.headers.set('domain', domain);
        }
     
        try {
          const response = await fetch(modifiedRequest);
          const modifiedResponse = new Response(response.body, response);
          modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
          modifiedResponse.headers.set('actualUrl', actualUrlStr);
          return modifiedResponse;

        } catch (error) {
          console.error(error.message);
          continue;
        }
      } 
    }

    // 如果所有URL都失败了，返回一个错误消息
    return new Response('All URLs failed', { status: 500 });
  },
};
