function setNuiFocus(state)
    SetNuiFocus(state, state)
end

function sendNuiMessageForEmote()
    SendNUIMessage({ data = "GET", emote = Config.Animations })
    setNuiFocus(true)
end

local isFastActive = false
function sendNuiMessageForFast()
    isFastActive = not isFastActive

    SendNUIMessage({data = "FAST", status = isFastActive})
    
    setNuiFocus(isFastActive, isFastActive) 
    
    if not isFastActive then
        DisplayRadar(true)
    else
        DisplayRadar(false)
    end
end


function handleCommand(command)
    if command == Config.Fast then
        sendNuiMessageForFast()
    elseif command == Config.Emote then
        sendNuiMessageForEmote()
    else
        setNuiFocus(false)
    end
end


RegisterKeyMapping(Config.Emote, 'Emote Menu', 'keyboard', Config.EmoteOpen)
RegisterKeyMapping(Config.Fast, 'Fast Bar', 'keyboard', Config.FastOpen)

RegisterCommand(Config.Fast, function() handleCommand(Config.Fast) end, false)
RegisterCommand(Config.Emote, function() handleCommand(Config.Emote) end, false)

RegisterNUICallback("exit", function(data)
    isFastActive = false
    setNuiFocus(false, false)
end)




-----------------------------

Citizen.CreateThread(function()
    Citizen.Wait(30)
    playAnimation('props', 'prop_laptop_lester')
end)

RegisterNetEvent('syncAnimationToClients')
AddEventHandler('syncAnimationToClients', function(playerId, category, animArgs)

    local playerPed = GetPlayerPed(GetPlayerFromServerId(playerId))

    if category == 'walking' then
        changeWalkingStyle(playerPed, animArgs)
    elseif category == 'smile' and animArgs[1] and animArgs[2] and animArgs[3] and animArgs[4] then
        playSpecificAnimation(playerPed, animArgs[1], animArgs[2], animArgs[3], animArgs[4])
    elseif category == 'misc' and animArgs[1] and animArgs[2] then
        playSpecificAnimation(playerPed, animArgs[1], animArgs[2])
    elseif category == 'dance' and animArgs[1] and animArgs[2] then
        playSpecificAnimation(playerPed, animArgs[1], animArgs[2])
    elseif category == 'props' then
        spawnPropInHand(playerPed, animArgs)
    else
        print("Invalid animation category or arguments:", category, animArgs)
    end
    
end)



RegisterNUICallback("playanim", function(anim)
    print(json.encode(anim))
    local animData = anim.data
    playAnimation(animData.category, animData.args)  
end)

function playAnimation(category, animArgs)
    local playerPed = PlayerPedId()
    local playerId = GetPlayerServerId(PlayerId())

    if category == 'walking' then
        changeWalkingStyle(playerPed, animArgs)
    elseif category == 'dance' then
        local dict, animName = getDanceAnim(animArgs)
        if dict and animName then
            playSpecificAnimation(playerPed, dict, animName)
            TriggerServerEvent('syncAnimation', playerId, category, {dict, animName})
        else
            print('Geçersiz dans animasyonu: ', animArgs)
        end
    elseif category == 'smile' then
        local dict, animName, facialDict, facialAnimName = getSmileAnim(animArgs)
        if dict and animName then
            playSpecificAnimation(playerPed, dict, animName, facialDict, facialAnimName)
            TriggerServerEvent('syncAnimation', playerId, category, {dict, animName, facialDict, facialAnimName})
        end
    elseif category == 'misc' then
        local dict, animName = getMiscAnim(animArgs)
        if dict and animName then
            playSpecificAnimation(playerPed, dict, animName)
            TriggerServerEvent('syncAnimation', playerId, category, {dict, animName})
        else
            print('Geçersiz misc animasyonu: ', animArgs)
        end
    elseif category == 'props' then
        spawnPropInHand(playerPed, animArgs)
        TriggerServerEvent('syncAnimation', playerId, category, animArgs)
    else
        print("Invalid animation category:", category)
    end
end

RegisterNetEvent('stopAnimationForAll')
AddEventHandler('stopAnimationForAll', function()
    local ped = PlayerPedId()
    ClearPedTasksImmediately(ped)
end)

function playSpecificAnimation(ped, dict, animName, facialDict, facialAnimName)
    if not DoesEntityExist(ped) or IsEntityDead(ped) then
        return 
    end
    loadAnimDict(dict)
    TaskPlayAnim(ped, dict, animName, 8.0, -8.0, -1, 49, 0, false, false, false)

    if facialDict and facialAnimName then
        loadAnimDict(facialDict)
        PlayFacialAnim(ped, facialAnimName, facialDict)
    end
    local isAnimationStopped = false

    Citizen.CreateThread(function()
        while not isAnimationStopped do
            Citizen.Wait(0)  
            local playerPedCoords = GetEntityCoords(ped)
            DrawText3Ds(playerPedCoords.x, playerPedCoords.y, playerPedCoords.z + 1.0, "Press "..Config.Name.." to stop the animation.")
            if IsControlJustReleased(0, Config.Stop) then
                TriggerServerEvent('requestStopAnimationForAll')
                isAnimationStopped = true
            end
        end
        ClearPedTasks(ped)
    end)
end


local propOffsets = Config.propOffsets
local propsList = {}
function spawnPropInHand(playerPed, propModel)
    for _, prop in ipairs(propsList) do
        if DoesEntityExist(prop) then
            DeleteObject(prop)
        end
    end
    propsList = {}
    RequestModel(propModel)
    while not HasModelLoaded(propModel) do
        Citizen.Wait(1)
    end
    local newProp = CreateObject(GetHashKey(propModel), 0, 0, 0, true, true, true)
    local offsetData = propOffsets[propModel] or { xOffset = 0.1, yOffset = 0.0, zOffset = 0.0, xRot = 0.0, yRot = 0.0, zRot = 0.0 }
    local propData = Config.getAnimDataForProp(propModel)
    local boneIndex

    if propData and propData.dict then
        boneIndex = GetPedBoneIndex(playerPed, propData.bone)
        RequestAnimDict(propData.dict)
        while not HasAnimDictLoaded(propData.dict) do
            Citizen.Wait(0)
        end
        TaskPlayAnim(playerPed, propData.dict, propData.name, 8.0, -8.0, -1, 1, 0, false, false, false)
    end
    AttachEntityToEntity(newProp, playerPed, boneIndex, offsetData.xOffset, offsetData.yOffset, offsetData.zOffset, offsetData.xRot, offsetData.yRot, offsetData.zRot, true, true, false, true, 1, true)
    AttachEntityToEntity(newProp, playerPed, boneIndex, offsetData.xOffset, offsetData.yOffset, offsetData.zOffset, offsetData.xRot, offsetData.yRot, offsetData.zRot, true, true, false, true, 1, true)
    table.insert(propsList, newProp)
    SetModelAsNoLongerNeeded(propModel)
    local textShown = true
        Citizen.CreateThread(function()
            while textShown do
                Citizen.Wait(0)
                local playerPedCoords = GetEntityCoords(playerPed)
                if textShown then 
                    DrawText3Ds(playerPedCoords.x, playerPedCoords.y, playerPedCoords.z + 1.0, "Press " .. Config.Name .. " to delete prop.")
                end
                if IsControlJustReleased(0, Config.Stop) then
                    for _, prop in ipairs(propsList) do
                        if DoesEntityExist(prop) then
                            DeleteObject(prop)
                        end
                    end
                    propsList = {}
                    textShown = false 
                    ClearPedTasksImmediately(playerPed)
                    ResetPedMovementClipset(playerPed, 0)
                end
            end
        end)
end

function DrawText3Ds(x, y, z, text)
    local onScreen,_x,_y=World3dToScreen2d(x,y,z)
    local px,py,pz=table.unpack(GetGameplayCamCoords())
    
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(1)
    AddTextComponentString(text)
    DrawText(_x,_y)
    local factor = (string.len(text)) / 370
    DrawRect(_x,_y+0.0145, 0.015+ factor, 0.03, 41, 11, 41, 68)
end

function loadAnimDict(dict)
    if not HasAnimDictLoaded(dict) then
        RequestAnimDict(dict)
        while not HasAnimDictLoaded(dict) do
            Citizen.Wait(1)
        end
    end
end

function changeWalkingStyle(ped, style)
    RequestAnimSet(style)
    while not HasAnimSetLoaded(style) do
        Citizen.Wait(0)
    end
    SetPedMovementClipset(ped, style, 1.0)
    
    Citizen.CreateThread(function()
        while true do
            Citizen.Wait(0)
            local playerPedCoords = GetEntityCoords(ped)
            DrawText3Ds(playerPedCoords.x, playerPedCoords.y, playerPedCoords.z + 1.0, "Press " .. Config.Name .. " to stop walk.")
            if IsControlJustReleased(0, Config.Stop) then
                ClearPedTasksImmediately(ped)
                ResetPedMovementClipset(ped, 0)
                break 
            end
        end
    end)
end
