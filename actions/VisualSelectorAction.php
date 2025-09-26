<?php

final class VisualSelectorAction implements ActionInterface
{
    public function __invoke(Request $request): Response
    {
        $url = $request->get('url');

        if (!$url) {
            return new Response(render(__DIR__ . '/../templates/error.html.php', ['message' => 'Missing URL parameter']), 400);
        }

        return new Response(render(__DIR__ . '/../templates/visual-selector.html.php', [
            'url' => $url,
        ]));
    }
}