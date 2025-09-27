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
        return null; // Should not happen
    }
});