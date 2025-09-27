<!DOCTYPE html>
<html>
<head>
    <title>Visual Selector</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: row;
        }
        #iframe-container {
            flex-grow: 1;
            height: 100%;
        }
        #iframe {
            width: 100%;
            height: 100%;
            border: none;
        }
        #control-panel {
            width: 300px;
            height: 100%;
            padding: 10px;
            box-sizing: border-box;
            border-left: 1px solid #ccc;
            overflow-y: auto;
        }
        .form-field {
            margin-bottom: 10px;
        }
        .input-group {
            display: flex;
        }
        .input-group input {
            flex-grow: 1;
        }
        .clear-button {
            margin-left: 5px;
        }
        .instructions {
            border: 1px solid #f0ad4e;
            background-color: #fcf8e3;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 14px;
        }
        .instructions p {
            margin: 0 0 5px 0;
        }
        .instructions code {
            background-color: #eee;
            padding: 2px 4px;
            border-radius: 3px;
        }
    </style>
    <script src="static/visual-selector.js"></script>
</head>
<body>
    <div id="control-panel">
        <h2>Visual Selector</h2>
        <div id="selection-display">
            <p><strong>Selected XPath:</strong></p>
            <code id="selected-xpath"></code>
        </div>
        <form id="selector-form">
            <div class="form-field">
                <label for="item">Item selector:</label>
                <div class="input-group">
                    <input type="text" id="item" name="item">
                    <button type="button" class="set-button" data-target="item">Set</button>
                    <button type="button" class="preview-button" data-target="item">Preview</button>
                    <button type="button" class="clear-button" data-target="item">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="title">Title selector:</label>
                <div class="input-group">
                    <input type="text" id="title" name="title">
                    <button type="button" class="set-button" data-target="title">Set</button>
                    <button type="button" class="preview-button" data-target="title">Preview</button>
                    <button type="button" class="clear-button" data-target="title">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="content">Description selector:</label>
                <div class="input-group">
                    <input type="text" id="content" name="content">
                    <button type="button" class="set-button" data-target="content">Set</button>
                    <button type="button" class="preview-button" data-target="content">Preview</button>
                    <button type="button" class="clear-button" data-target="content">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="uri">URL selector:</label>
                <div class="input-group">
                    <input type="text" id="uri" name="uri">
                    <button type="button" class="set-button" data-target="uri">Set</button>
                    <button type="button" class="preview-button" data-target="uri">Preview</button>
                    <button type="button" class="clear-button" data-target="uri">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="author">Author selector:</label>
                <div class="input-group">
                    <input type="text" id="author" name="author">
                    <button type="button" class="set-button" data-target="author">Set</button>
                    <button type="button" class="preview-button" data-target="author">Preview</button>
                    <button type="button" class="clear-button" data-target="author">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="timestamp">Date selector:</label>
                <div class="input-group">
                    <input type="text" id="timestamp" name="timestamp">
                    <button type="button" class="set-button" data-target="timestamp">Set</button>
                    <button type="button" class="preview-button" data-target="timestamp">Preview</button>
                    <button type="button" class="clear-button" data-target="timestamp">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="enclosures">Image selector:</label>
                <div class="input-group">
                    <input type="text" id="enclosures" name="enclosures">
                    <button type="button" class="set-button" data-target="enclosures">Set</button>
                    <button type="button" class="preview-button" data-target="enclosures">Preview</button>
                    <button type="button" class="clear-button" data-target="enclosures">Clear</button>
                </div>
            </div>
            <div class="form-field">
                <label for="categories">Category selector:</label>
                <div class="input-group">
                    <input type="text" id="categories" name="categories">
                    <button type="button" class="set-button" data-target="categories">Set</button>
                    <button type="button" class="preview-button" data-target="categories">Preview</button>
                    <button type="button" class="clear-button" data-target="categories">Clear</button>
                </div>
            </div>
            <br>
            <button type="button" id="save-selectors">Save and Close</button>
        </form>
    </div>
    <div id="iframe-container">
        <iframe id="iframe" src="?action=proxy&url=<?= e(urlencode($url)) ?>"></iframe>
    </div>
</body>
</html>