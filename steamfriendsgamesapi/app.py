from flask import Flask
from flask import request

import main

app = Flask(__name__)

@app.route('/get_steam_friends/')
def get_steam_friends():
    steam_username_url = request.args.get('steam_username_url')
    if not main.get_steam_id(steam_username_url):
        return 'VanityURL not set up'
    return str(main.get_friends_username_list(steam_username_url))

@app.route('/get_games_users_have_in_common/')
def get_games_users_have_in_common():
    steam_user = request.args.get('steam_user')
    comma_separated_steam_friend_usernames = request.args.get('comma_separated_steam_friend_usernames')
    steam_profiles = main.get_friends_game_info(steam_user,comma_separated_steam_friend_usernames)
    return str(main.get_common_games(steam_profiles))