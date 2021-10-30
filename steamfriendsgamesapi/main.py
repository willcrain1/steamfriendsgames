import requests
import json

with open("steam_api_key.json","r") as json_config_file:
    config_json_data = json.load(json_config_file)
steam_api_key = config_json_data.get('key')

def get_steam_id(steam_username):
    return requests.get('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?vanityurl='+steam_username+'&key='+steam_api_key).json().get('response').get('steamid')

def get_friends_list(steam_username):
    url = 'http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key='+steam_api_key+'&steamid='+get_steam_id(steam_username)+'&relationship=friend'
    return requests.get(url).json().get('friendslist').get('friends')

def get_friends_username_list(steam_username):
    steam_id_name_mapping_list = []
    friends_id_buffer = []
    friend_count = len(get_friends_list(steam_username))
    for friend in get_friends_list(steam_username):
        friends_id_buffer.append(friend.get('steamid'))
        if len(friends_id_buffer) == 100 or len(steam_id_name_mapping_list) + len(friends_id_buffer) == friend_count:
            get_player_summary_url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=' + steam_api_key + '&steamids=' + ','.join(
                friends_id_buffer)
            player_summary_response = requests.get(get_player_summary_url)
            for player in player_summary_response.json().get('response').get('players'):
                steam_id_name_mapping_list.append(
                    {'steamid': player.get('steamid'), 'steam_username': player.get('personaname')})
    return steam_id_name_mapping_list

def get_friends_game_info(steam_user,comma_separated_usernames):
    steam_id_name_game_mapping = []
    friend_list = get_friends_username_list(steam_user)
    users_to_compare = []
    for friend in friend_list:
        if friend.get('steam_username') in comma_separated_usernames.split(','):
            users_to_compare.append(friend)
    self_summary = requests.get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=' + steam_api_key +
                                '&steamids='+get_steam_id(steam_user)).json().get('response').get('players')[0]
    users_to_compare.append({'steamid':self_summary.get('steamid'),'steam_username':self_summary.get('personaname')})
    for user in users_to_compare:
        get_owned_games_url = 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key='+steam_api_key+'&steamid='+user.get('steamid')+'&format=json&include_appinfo=1'
        games_owned = []
        games_owned_response = requests.get(get_owned_games_url).json()
        for game in games_owned_response.get('response').get('games'):
            games_owned.append(game.get('name'))
        steam_id_name_game_mapping.append({'steam_username':user.get('steam_username'),'game_list':games_owned})
    return steam_id_name_game_mapping

def get_common_games(list_of_steam_profiles):
    setlist_of_game_sets = []
    for profile in list_of_steam_profiles:
        setlist_of_game_sets.append(set(profile.get('game_list')))
    return setlist_of_game_sets[0].intersection(*setlist_of_game_sets)
