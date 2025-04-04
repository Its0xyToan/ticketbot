import {panelOptions} from "./panelOptions.js";

export const languages = {
    en: {
        panel: {
            embedDescription: `
Need assistance with our bot or interested in a partnership? Open a ticket, and our team will get back to you as soon as possible!  

> 📌 **Categories:**  
${panelOptions.map(option => `- ${option.disabled ? "`❌` Disabled" : "`✅` Enabled "} | \`${option.emoji}\` **${option.name}** - ${option.description}`).join("\n")}

Click the button below to create a ticket! \`🎫\``
        },
        inTicket: {
            embedDescription: `
> Thank you for contacting us! We will get back to you as soon as possible!
\`🔕\` While you are waiting, you can send informations about your problem/request in the ticket.
`
        }
    }
}