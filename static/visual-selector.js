document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.getElementById('iframe');
    const selectedXpathDisplay = document.getElementById('selected-xpath');
    const controlPanel = document.getElementById('control-panel');

    let currentXpath = '';

    iframe.addEventListener('load', () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Add a style element for highlighting previewed elements
        const style = iframeDocument.createElement('style');
        style.innerHTML = '.rss-bridge-highlight { outline: 3px solid #33cc33 !important; background-color: rgba(51, 204, 51, 0.3) !important; }';
        iframeDocument.head.appendChild(style);

        // Highlight elements on mouseover
        iframeDocument.addEventListener('mouseover', (event) => {
            event.target.style.outline = '2px solid red';
        });
        iframeDocument.addEventListener('mouseout', (event) => {
            event.target.style.outline = '';
        });

        // Handle element selection
        iframeDocument.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.target.style.outline = ''; // Remove outline on click

            currentXpath = getXPath(event.target);
            selectedXpathDisplay.textContent = currentXpath;
        }, true);
    });

    // Handle "Set", "Clear", and "Preview" buttons
    controlPanel.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.dataset.target) return;

        const inputId = target.dataset.target;
        const inputField = document.getElementById(inputId);
        if (!inputField) return;

        if (target.classList.contains('set-button')) {
            inputField.value = currentXpath;
        } else if (target.classList.contains('clear-button')) {
            inputField.value = '';
            previewXPath(''); // Clear preview when clearing input
        } else if (target.classList.contains('preview-button')) {
            previewXPath(inputField.value);
        }
    });

    function previewXPath(xpath) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Clear previous highlights
        const previouslyHighlighted = iframeDocument.querySelectorAll('.rss-bridge-highlight');
        previouslyHighlighted.forEach(el => el.classList.remove('rss-bridge-highlight'));

        if (!xpath) {
            return; // Nothing to preview
        }

        try {
            const result = iframeDocument.evaluate(xpath, iframeDocument, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < result.snapshotLength; i++) {
                const node = result.snapshotItem(i);
                if (node.nodeType === Node.ELEMENT_NODE) {
                    node.classList.add('rss-bridge-highlight');
                }
            }
            if (result.snapshotLength === 0) {
                alert('No elements found for this XPath.');
            }
        } catch (e) {
            alert('Invalid XPath expression: ' .concat(e.message));
        }
    }

    // Handle "Save and Close" button
    const saveButton = document.getElementById('save-selectors');
    saveButton.addEventListener('click', () => {
        if (window.opener && !window.opener.closed) {
            const urlParams = new URLSearchParams(window.location.search);
            const bridgeId = urlParams.get('bridgeId');

            if (!bridgeId) {
                alert('Error: Could not find the bridge ID. Cannot save.');
                return;
            }

            const form = document.getElementById('selector-form');
            const inputs = form.querySelectorAll('input[type=text]');

            inputs.forEach(input => {
                const targetInput = window.opener.document.querySelector(`#${bridgeId} input[name=${input.name}]`);
                if (targetInput) {
                    targetInput.value = input.value;
                } else {
                    console.warn(`Could not find input with name "${input.name}" in the original form.`);
                }
            });

            window.close();
        } else {
            alert('Error: Could not find the original window. Cannot save.');
        }
    });

    function getXPath(element) {
        const parts = [];
        for (; element && element.nodeType === Node.ELEMENT_NODE; element = element.parentNode) {
            let part = element.tagName.toLowerCase();
            if (element.id) {
                // ID is unique, so we can stop here
                part = `*[@id='${element.id}']`;
                parts.unshift(part);
                break;
            }

            const classes = Array.from(element.classList);
            if (classes.length > 0) {
                // Use classes to make the selector more specific and general
                const classConditions = classes.map(c => `contains(concat(' ', normalize-space(@class), ' '), ' ${c} ')`).join(' and ');
                part += `[${classConditions}]`;
            } else {
                // Fallback to positional index if no classes are available
                let index = 1;
                let sibling = element.previousElementSibling;
                while (sibling) {
                    if (sibling.tagName === element.tagName) {
                        index++;
                    }
                    sibling = sibling.previousElementSibling;
                }
                part += `[${index}]`;
            }
            parts.unshift(part);
        }
        return parts.length ? '//' + parts.join('/') : null;
    }
});