document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.getElementById('iframe');
    const selectedXpathDisplay = document.getElementById('selected-xpath');
    const controlPanel = document.getElementById('control-panel');
    const generalizeCheckbox = document.getElementById('generalize-item');
    const itemInput = document.getElementById('item');

    let currentXpath = '';
    let specificItemXpath = ''; // To store the specific path before generalization

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
            if (inputId === 'item') {
                specificItemXpath = currentXpath;
                generalizeCheckbox.checked = false;
            }
        } else if (target.classList.contains('clear-button')) {
            inputField.value = '';
            previewXPath(''); // Clear preview when clearing input
        } else if (target.classList.contains('preview-button')) {
            previewXPath(inputField.value);
        }
    });

    // Handle generalize checkbox
    generalizeCheckbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            if (itemInput.value) {
                // Store the current value as the specific path if it's not already generalized
                if (itemInput.value.match(/\[\d+\]$/)) {
                    specificItemXpath = itemInput.value;
                }
                // Generalize the path by removing the last positional predicate
                itemInput.value = itemInput.value.replace(/\[\d+\]$/, '');
            }
        } else {
            // Revert to the specific path if it exists
            if (specificItemXpath) {
                itemInput.value = specificItemXpath;
            }
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
        if (element.id !== '') {
            return `//*[@id='${element.id}']`;
        }
        if (element === document.body) {
            return '/html/body';
        }

        let ix = 0;
        const siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i];
            if (sibling === element) {
                return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
        return null;
    }
});