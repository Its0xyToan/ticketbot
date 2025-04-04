import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  IntentsBitField,
  MessageFlags,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import { configDotenv } from "dotenv";
import { languages } from "./languages.js";
import { panelOptions } from "./panelOptions.js";
import { ticketPriorities } from "./ticketPriorities.js";
import { getTickets, writeTickets } from "./saver.js";
configDotenv();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const BotTheme = {
  primary: "#A9E1FF",
  secondary: "#FF495C",
  accent: "#3DDC97",
  warn: "#dbbd3d",
};

client.once("ready", () => {
  console.log("🟢 || Ticket bot is now Ready !");
});

const components = [
  new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("panel.openticket")
      .setOptions(
        panelOptions.map((v) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(v.name)
            .setValue(v.name)
            .setDescription(v.description)
            .setEmoji(v.emoji),
        ),
      ),
  ),
];

client.on("messageCreate", async (msg) => {
  if (msg.content === `<@${client.user.id}>`) {
    return msg.reply({
      content: `Use \`${process.env.PREFIX}help\` to see all my commands !`,
    });
  }

  if (!msg.content.startsWith(process.env.PREFIX)) return;
  const args = msg.content.split(" ");
  const command = args[0];

  if (command === process.env.PREFIX + "send") {
    if (msg.author.id !== process.env.OWNER) return;
    console.log(
      `🟠 || Sending panel in #${msg.channel.name} (${msg.channel.id}) !`,
    );

    const embed = new EmbedBuilder()
      .setTitle("🎟️ Tickets")
      .setDescription(languages.en.panel.embedDescription)
      .setColor(BotTheme.primary)
      .setFooter({ text: "Serverly." });

    await msg.channel
      .send({ embeds: [embed], components })
      .then((m) => m.pin());
    await msg.delete();
  } else if (command === process.env.PREFIX + "unclaim") {
    if (!msg.member.roles.cache.has(process.env.STAFF_ROLE))
      return msg.reply({
        content: "You do not have the permissions to do this.",
      });

    const tickets = getTickets();
    const ticket = tickets.opened.find((v) => v.channelId === msg.channel.id);

    if (!ticket)
      return msg.reply({ content: "Please execute this command in a ticket." });

    if (!ticket.claimed)
      return msg.reply({ content: "This ticket is not claimed." });

    ticket.claimed = false;
    writeTickets(tickets);
    await msg.reply({ content: "Ticket unclaimed." });
  } else if (command === process.env.PREFIX + "claim") {
    if (!msg.member.roles.cache.has(process.env.STAFF_ROLE))
      return msg.reply({
        content: "You do not have the permissions to do this.",
      });

    const tickets = getTickets();
    const ticket = tickets.opened.find((v) => v.channelId === msg.channel.id);

    if (!ticket)
      return msg.reply({ content: "Please execute this command in a ticket." });

    if (ticket.claimed !== false)
      return msg.reply({ content: "This ticket is already claimed." });

    ticket.claimed = msg.author.id;
    writeTickets(tickets);
    await msg.reply({ content: `Ticket claimed by <@${msg.author.id}>.` });
  } else if (command === process.env.PREFIX + "help") {
    await msg.reply({
      content: `**Available Commands**:
- \`f;send\` (Owner only)
- \`f;claim\` (Ticket)
- \`f;unclaim\` (Ticket)
- \`f;help\``,
    });
  }
});

client.on("interactionCreate", async (i) => {
  if (i.isStringSelectMenu()) {
    const ticketType = i.values[0];
    const ttype = panelOptions.find((v) => v.name === ticketType);
    if (ttype.disabled) {
      await i.message.edit({ components });
      return i.reply({
        content: "This ticket type is disabled...",
        flags: [MessageFlags.Ephemeral],
      });
    }

    const cat =
      i.guild.channels.cache.get(process.env.TICKET_CATEGORY) ??
      (await i.guild.channels.fetch(process.env.TICKET_CATEGORY));
    const channel = await cat.children.create({
      name: `${ticketPriorities.low}┃${ttype.smallName}┃${i.user.username}`,
      permissionOverwrites: [
        {
          id: i.user.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: process.env.STAFF_ROLE,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: i.guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    await channel.send({
      content: `<@&${process.env.STAFF_ROLE}> | <@${i.user.id}>`,
      embeds: [
        new EmbedBuilder()
          .setTitle("🎟️ Ticket")
          .setDescription(languages.en.inTicket.embedDescription)
          .setColor(BotTheme.primary)
          .setFooter({ text: "Serverly." }),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket.close")
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("ticket.claim")
            .setLabel("Claim Ticket")
            .setStyle(ButtonStyle.Success),
        ),
      ],
    });

    const tickets = getTickets();
    tickets.opened.push({
      creator: i.user.id,
      channelId: channel.id,
      type: ttype.name,
      claimed: false,
    });
    writeTickets(tickets);

    await i.reply({
      content: `\`🟢\` - Ticket created <#${channel.id}> !`,
      flags: [MessageFlags.Ephemeral],
    });
    await i.message.edit({ components });
  }

  if (i.isButton()) {
    const tickets = getTickets();
    const ticket = tickets.opened.find((v) => v.channelId === i.channelId);

    if (i.customId === "ticket.close") {
      if (!i.member.roles.cache.has(process.env.STAFF_ROLE))
        return i.reply({
          content: "You do not have the permissions to do this.",
          flags: [MessageFlags.Ephemeral],
        });

      await i.reply({
        content: "Closing ticket... Moving save...",
      });

      const index = tickets.opened.indexOf(ticket);
      tickets.opened.splice(index, 1);
      tickets.closed.push(ticket);
      writeTickets(tickets);

      await new Promise((r) => setTimeout(r, 5000));

      await i.editReply({
        content: "Closing ticket... Transcript is being created",
      });
      const c = await i.channel.fetch();
      const messages = await c.messages.fetch();

      const msgsString = messages
        .map(
          (m) =>
            `${new Date(m.createdTimestamp).toLocaleString("en-US")} - ${m.author.username} : ${m.content} ${m.embeds.length > 0 ? `(embeds: ${m.embeds.length})` : ""}`,
        )
        .reverse()
        .join("\n");

      const attachment = Buffer.from(msgsString);
      const logsChannel =
        i.guild.channels.cache.get(process.env.LOGS_CHANNEL) ??
        (await i.guild.channels.fetch(process.env.LOGS_CHANNEL));
      logsChannel.send({
        files: [{ attachment: attachment, name: "transcript.yml" }],
        embeds: [
          {
            title: "Ticket Transcript",
            description: `Ticket created by <@${ticket.creator}>, ${ticket.claimed ? ` and claimed by <@${ticket.claimed}>` : `not claimed by anyone,`} was closed by <@${i.user.id}>`,
            fields: [
              {
                name: "Creator",
                value: `<@${ticket.creator}>`,
              },
              {
                name: "Claimed",
                value: ticket.claimed ? `<@${ticket.claimed}>` : "Not claimed",
              },
              {
                name: "Closed",
                value: `<@${i.user.id}>`,
              },
            ],
          },
        ],
      });

      await i.editReply({
        content: "Closing ticket... Deleting channel in 5s",
      });

      setTimeout(async () => {
        await i.channel.delete();
      }, 5000);
    }
    if (i.customId === "ticket.claim") {
      if (ticket.claimed !== false)
        return i.reply({
          content: "This ticket is already claimed.",
          flags: [MessageFlags.Ephemeral],
        });

      ticket.claimed = i.user.id;
      writeTickets(tickets);

      await i.reply({
        content: `Ticket claimed by <@${i.user.id}> !`,
      });
    }
  }
});

client.login(process.env.TOKEN);
