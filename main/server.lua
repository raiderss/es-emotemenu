RegisterServerEvent('syncAnimation')
AddEventHandler('syncAnimation', function(playerId, category, animArgs)
    print(GetCurrentResourceName(), playerId, category, animArgs)
    TriggerClientEvent('syncAnimationToClients', -1, playerId, category, animArgs) 
end)


RegisterServerEvent('requestStopAnimationForAll')
AddEventHandler('requestStopAnimationForAll', function()
    TriggerClientEvent('stopAnimationForAll', -1) 
end)
