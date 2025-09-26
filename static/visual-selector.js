document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.getElementById('iframe');
    const selectedXpathDisplay = document.getElementById('selected-xpath');
    const controlPanel = document.getElementById('control-panel');

    let currentXpath = '';

    iframe.addEventListener('load', () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

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

    // Handle "Set" and "Clear" buttons
    controlPanel.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('set-button')) {
            const inputId = target.dataset.target;
            const inputField = document.getElementById(inputId);
            if (inputField) {
                inputField.value = currentXpath;
            }
        } else if (target.classList.contains('clear-button')) {
            const inputId = target.dataset.target;
            const inputField = document.getElementById(inputId);
            if (inputField) {
                inputField.value = '';
            }
        }
    });

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
                // The query needs to be scoped to the opener's document
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
        if (element.id) {
            return `//${element.tagName.toLowerCase()}[@id='${element.id}']`;
        }
        if (element === document.body) {
            return '/html/body';
        }

        let path = '';
        let current = element;
        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.nodeName.toLowerCase();
            if (current.className) {
                const classes = current.className.trim().split(/\s+/).join('.');
                selector += `[contains(@class, '${classes.replace(/\./g, "') and contains(@class, '")}')]`;
            } else {
                 const siblings = Array.from(current.parentNode.children).filter(
                    (sibling) => sibling.nodeName === current.nodeName
                );
                if (siblings.length > 1) {
                    const index = siblings.indexOf(current) + 1;
                    selector += `[${index}]`;
                }
            }

            path = '/' + selector + path;

            // Stop at body or if parent is not an element
            if (current.parentNode === document.body || !current.parentNode || current.parentNode.nodeType !== Node.ELEMENT_NODE) {
                path = '/html/body' + path;
                break;
            }
            current = current.parentNode;
        }
        return path;
    }
});