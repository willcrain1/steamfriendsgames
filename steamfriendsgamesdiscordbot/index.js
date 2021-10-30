const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const request = require("request");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        return interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    }

});

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    //TODO: put event listeners in another folder
    if (interaction.customId === 'select_steam_users') {
        interaction.deferUpdate();
        const initial_steam_user = interaction.values[0].split('|')[0]
        const formatted_values = []
        for(var i = 0; i < interaction.values.length; i++) {
            const usernames = interaction.values[i].split('|')
            formatted_values.push(usernames[1])
        }
        request(`http://127.0.0.1:5000/get_games_users_have_in_common/?steam_user=${initial_steam_user}&comma_separated_steam_friend_usernames=${formatted_values.join()}`, function (error, response, body) {
            console.error('error:', error);
            console.log('statusCode:', response && response.statusCode);
            formatted_body = body.replaceAll('{\'','["');
            formatted_body = formatted_body.replaceAll('\'}','"]');
            formatted_body = formatted_body.replaceAll('", \'','\', \'');
            formatted_body = formatted_body.replaceAll('\', "','\', \'');
            formatted_body = formatted_body.replaceAll('\', \'','","');
            var games_array = JSON.parse(formatted_body);
            var games_string = ""
            for (var game in games_array){
                if (games_array.hasOwnProperty(game)){
                    games_string += games_array[game] + "\n"
                }
            }
            interaction.editReply({'content': games_string});
        });
    }
});

client.login(token);