## 🚀 Ticket Bot
- This is a Discord bot that allows users to create tickets for support or other purposes.

### 📝 Features
- Claims
- Really customisable
- Easy to use
- Commands
- Tests

### 🔕 Commands
- `send`: Sends the ticket panel.
- `claim`: Claims the current ticket.
- `unclaim`: Unclaims the current ticket.

### 💭 Setup
- Clone the repository:
  ```bash
  git clone https://github.com/Its0xyToan/ticketbot.git
  cd ticket-bot
  ```
- You will need to create a `.env` file in the root directory of the project and fill in the required information. You can use the `.env.example` file as a template.
- Edit the panelOptions.js file to configure the types of ticket people will be able to create.
- Start the bot (This will test the configuration and everything):
  ```bash
  npm start
  ```
  or if you are forking to develop locally
  ```bash
  npm test && npm run dev
  ```
- And voilà ! Enjoy !

### 😀 Contributing
- Fork the repository and create a pull request. Thanks !
