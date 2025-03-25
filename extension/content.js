// help us inject the button on gmail interface and api call and everything
console.log("EMAIL WRITER EXTENSION")
// mutation observer to detect when the compose window or reply window is opened
// we will add buttons to both of them
// mutation observer helps observe changes made in dom tree

function createAIButton() {
    // create the button siimilar to gmail send button
    // button is being replicated as a div in gmail app thats why we are doing so 
    // so create button and create eleent div for the button
    const button = document.createElement("div")
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';

    // style the button similar to gmail send button
    button.style.marginRight = "8px";
    button.style.borderRadius = "30px";
    button.style.marginTop = "4px";
    button.innerHTML = "AI Reply"
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply')
    return button;
}
function findComposeToolbar() {
    // select it using node classes
    const selectors = [
        ".btC", '[role="toolbar"]', ".gU.Up", ".aDh"
    ];

    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
        return null
    }

}

function getEmailContent() {
    // fetch all the email content 
    const selectors = [
        '.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'
    ]

    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
        return '';
    }

}


function injectButton() {
    console.log("injection called")

    const existingButton = document.querySelector('.ai-reply-button');
    // const existingBtn=document.querySelector('.tone-button');
    if (existingButton) existingButton.remove();
    // if(existingBtn)existingBtn.remove();
    const toolbar = findComposeToolbar();
    if (!toolbar) {
        // toolbar is where all buttons are present
        console.log("no toolbar")
        return;
    }
    console.log("Toolbar found, creating AI button");

    const button = createAIButton();
    // adding class to our button
    button.classList.add("ai-reply-button");


    button.addEventListener("click", async () => {
        // now write logic of button
        try {
            // when clicked it should show message generating
            button.innerHTML = "Generating...."
            button.disabled = true; // no one should press the button while generating
            const emailContent = getEmailContent();
            console.log("emailContent --- ", emailContent)
            // now make an api call
            const response = await fetch("http://localhost:8080/api/email/generate", {
                // privde the content and tone
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            })
            if (!response.ok) {
                throw new Error("API request failed")
            }
            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]')

            // set the value of compose box to hgenerted reply
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.log("compose box not found")
            }

        } catch (error) {
            console.log(error)
        } finally {
            button.innerHTML = "AI Reply"
            button.disabled = false
        }
    })

    // insert the button before the first child in toolbar
    toolbar.insertBefore(button, toolbar.firstChild);
}
// one mutation observer to check for compose window
const observer = new MutationObserver((mutations) => {
    // we are accepting a list of mutations
    for (const mutation of mutations) {
        // single mutation is a change in dom
        const addedNodes = Array.from(mutation.addedNodes)
        // added nodes prop contains the nodes added to dom
        // check if added nodes match the gmail compose window
        const hasComposedElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh,.btC, [role="dialog"]') || node.querySelector('.aDh,.btC, [role="dialog"]'))
        )
        if (hasComposedElements) {
            console.log("COMPOSE WINDOW DETECteD")
            setTimeout(injectButton, 500);
        }
    }
})

observer.observe(document.body, {
    childList: true, //watches for additional nodes
    subtree: true
})

// one mutation observer when change in url happens
