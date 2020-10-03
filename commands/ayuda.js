/**
 * @type {import("../bot").Command}
 */
module.exports = {
  hidden: false,
  roles: [],
  channels: [],
  usage: "",
  description: "Mostrar este mensaje de ayuda",
  exec: async ({message, commands, split}) => {
    await message.react("🤖");

    const commandList = [...commands.entries()].filter(([,command]) => !command.hidden).map(([name, command]) => {
      return ` - ${command.description}: \`!${name} ${command.usage}\``
    }).join("\n")

    await message.reply(`Lista de comandos:
${commandList}`)
  }
}