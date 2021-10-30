const { SlashCommandBuilder } = require('@discordjs/builders');
const request = require('request');
const {MessageActionRow, MessageSelectMenu} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('what_should_we_play')
        .setDescription('Check common games your steam friends have to see what you can play together.')
        .addStringOption(option =>
            option.setName('steam_username_url')
                .setDescription('Steam profile url. ex: https://steamcommunity.com/id/psychokilla2193/  uses \'psychokilla2193\'')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.isCommand()) {
            let options_map = new Map();
            for(let i = 0; i < interaction.options._hoistedOptions.length; i++){
                options_map.set(interaction.options._hoistedOptions[i].name,interaction.options._hoistedOptions[i].value)
            }
            request('http://127.0.0.1:5000/get_steam_friends/?steam_username_url='+ String(options_map.get('steam_username_url')), function (error, response, body) {
                console.error('error:', error);
                console.log('statusCode:', response && response.statusCode);
                if(body == 'VanityURL not set up'){
                    interaction.reply('Steam profile URL not existing for provided steam_username_url.  Steam nicknames are not unique, so we use Steam profile urls to look up your account.  ' +
                        'For example, if your steam profile url was https://steamcommunity.com/id/psychokilla2193/  then use \'psychokilla2193\' as the argument to the command.  ' +
                        'To set up or check your steam custom URL, follow these instructions - https://www.makeuseof.com/how-to-set-up-custom-url-steam-profile/')
                }else if(body == '[]') {
                    interaction.reply(`Not able to detect friends for user with profile url https://steamcommunity.com/id/${String(options_map.get('steam_username_url'))}/`)
                }else {
                    var formatted_body = body.replaceAll('\'', '"');
                    var steam_profiles_array = JSON.parse(formatted_body);
                    const steam_friend_choices = [];
                    for (let i = 0; i < steam_profiles_array.length; i++) {
                        steam_friend_choices.push({
                            label: steam_profiles_array[i]['steam_username'],
                            description: 'Steam User ' + steam_profiles_array[i]['steam_username'],
                            value: `${String(options_map.get('steam_username_url'))}|${steam_profiles_array[i]['steam_username']}`
                        })
                    }
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('select_steam_users')
                                .setPlaceholder('Nothing selected')
                                .setMinValues(1)
                                .setMaxValues(steam_friend_choices.length)
                                .addOptions(steam_friend_choices)
                        )
                    interaction.reply({
                        content: `Choose friends of user with profile url ${String(options_map.get('steam_username_url'))} to see games owned in common.`,
                        components: [row]
                    })
                }
            });
        }
    }
};