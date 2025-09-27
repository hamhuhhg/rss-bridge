<?php

class ProxyAction implements ActionInterface
{
    private CurlHttpClient $httpClient;

    public function __construct(CurlHttpClient $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    public function __invoke(Request $request): Response
    {
        $url = $request->get('url');

        if (!$url) {
            return new Response(render(__DIR__ . '/../templates/error.html.php', ['message' => 'Missing URL parameter']), 400);
        }

        try {
            $response = $this->httpClient->request($url);

            $headers = $response->getHeaders();
            $contentType = '';
            foreach ($headers as $name => $value) {
                if (strtolower($name) === 'content-type') {
                    $contentType = is_array($value) ? $value[0] : $value;
                    break;
                }
            }

            // Only process HTML content
            if (strpos($contentType, 'text/html') === false) {
                return new Response($response->getBody(), 200, ['Content-Type' => $contentType]);
            }

            $html = $response->getBody();
            $dom = str_get_html($html, true, true, DEFAULT_TARGET_CHARSET, true, DEFAULT_BR_TEXT, DEFAULT_SPAN_TEXT);

            if (!$dom) {
                return new Response($html, 200, ['Content-Type' => $contentType]);
            }

            $base_url = $url;

            // Rewrite all relative URLs to absolute URLs, then proxy them
            foreach($dom->find('[href], [src], [action]') as $element) {
                $attr = $element->href ? 'href' : ($element->src ? 'src' : 'action');
                $original_url = $element->$attr;

                if ($original_url && !preg_match('/^(data|http|https):/i', $original_url)) {
                    $new_url = urljoin($base_url, $original_url);
                    $element->$attr = '?action=proxy&url=' . urlencode($new_url);
                }
            }

            return new Response($dom->save(), 200, ['Content-Type' => $contentType]);

        } catch (\Exception $e) {
            return new Response(render(__DIR__ . '/../templates/error.html.php', ['message' => 'Failed to proxy the request: ' . $e->getMessage()]), 500);
        }
    }
}