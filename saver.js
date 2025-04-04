import * as fs from "node:fs";

export const writeTickets = (newData) => {
    fs.writeFileSync("./saves/tickets.json", JSON.stringify(newData, null, 4));
}

export const getTickets = () => {
    return JSON.parse(fs.readFileSync("./saves/tickets.json", "utf8"));
}