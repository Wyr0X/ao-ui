import { useTranslation } from 'react-i18next';
import AoButton from '../../../Common/ao-button/ao-button'
import AoDialog from '../../../Common/ao-dialog/ao-dialog'
import { useDispatch, useSelector } from 'react-redux';
import { setGameActiveDialog } from '../../../../redux/GameplaySlices/GameStateSlice';
import './world-map.scss';
import { FrameMap } from './FrameMap/framemap'
import { FrameNpc } from './FrameNpc/framenpc'
import Frame from '../../../Common/Frame/frame';
import { useState } from 'react';
import { GetRootDirectory } from '../../../../Tools/Utils';
import AoCheckbox from '../../../Common/ao-checkbox/ao-checkbox';
import AoInput from '../../../Common/ao-input/ao-input';
import { ErrorBoundary } from '../../../ErrorBoundary/error-boundary';
import { FindNpc } from './FindNpc/find-npc';
import { NpcDetails } from './FrameNpc/npc-details';
import { NpcPreview } from './FrameNpc/npc-preview';
import { Actions, MouseButtons, Worlds } from '../../../../constants';
import { selectClanSignal, selectCurrentCoordinates, selectMapNumber, setClanSignal } from '../../../../redux/GameplaySlices/MapInfoSlice';
import { MapMarker } from './map-marker';

const IgnoreMapNumbers = [400, 300]

const IgnoreMapNumber = number => {
  return IgnoreMapNumbers.includes(number)
}
const GetWorldImage = image => {
  return `${GetRootDirectory()}/Interface/${image}.bmp`
}

let WorldGrid = null
const GetWorlds = () => {
  if (!WorldGrid) {
    WorldGrid = window.parent.BabelUI.GetWorldGrid()
  }
  return WorldGrid.worlds
}
const GetWorldGrid = worldIndex => {
  
  return GetWorlds()[worldIndex]
}

const getBackgroundStyle = (showSafe, mapInfo, isSelected, number, clanSignal) => {
  var composedStyle = ''
  if (IgnoreMapNumber(number)) return composedStyle
  if (isSelected) {
    composedStyle = 'selected-grid-element'
  } else if (clanSignal && clanSignal.map === number) {
    composedStyle = 'clan-grid-element'
  }
  if (!showSafe) return composedStyle
  if (mapInfo.isSafe) {
    return 'safe-area ' +  composedStyle
  }
  return 'unsafe-area ' +  composedStyle
}

const CellSize = 25;
export const WorldMap = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [ dialogState, setDialogState] = useState({
     activeWorld: 0,
     selectedNpc:null,
     showMapNumbers:false,
     displaySafeUnsafe:false,
     selectedMap: -1,
     findMap: "",
     popupsState: null
    })
  const { activeWorld, 
        selectedNpc, 
        showMapNumbers,
        displaySafeUnsafe,
        selectedMap,
        findMap,
        popupsState } = dialogState
  const onClose = e => {
    dispatch(setGameActiveDialog(null))
  }
  const clanSignal = useSelector(selectClanSignal)
  if (clanSignal) {
    const now = Date.now()
    if (now - clanSignal.startTime > 60000) {
      dispatch(setClanSignal(null))
    }
  }
  const userMap = useSelector(selectMapNumber)
  const selectedGrid = GetWorldGrid(activeWorld)
  const grid = selectedGrid.mapList
  const selectedMapDetails = selectedGrid.mapDetails[selectedMap]
  const selectedNpcDetails = selectedNpc != null ? window.parent.BabelUI.GetNpcDetails(selectedNpc) : null

  const gridStyle = {
    gridTemplateColumns: `repeat(${selectedGrid.width}, 1fr)`,
    width: `${selectedGrid.width * CellSize}px`,
    height: `${selectedGrid.height *CellSize}px`
  }
  const onChangeWorld = world => {
    if (activeWorld !== world.index) {
      setDialogState({...dialogState, activeWorld: world.index})
    }
  }
  const selectNpc = npc => {
    setDialogState({...dialogState, selectedNpc: npc.index})
  }
  const mapImageStyle = {
    width: `${selectedGrid.width * CellSize}px`,
    height: `${selectedGrid.height *CellSize}px`
  }
  const cellSize = {
    width: `${CellSize}px`,
    height: `${CellSize}px`
  }
  const handleChange = (evt, value) => {
    const { name } = evt.target;
    setDialogState({ ...dialogState, [name]: value});
  }

  const updateMapSearch = (evt) => {
    updateSelectedMapAndNpc(evt.target.value, selectedNpc)
  }

  const updateSelectedMapAndNpc = (mapNumberIndex, newNpcSelection) => {
    const mapNumber = parseInt(mapNumberIndex)
    var targetWorld = 0;
    for (var i = 0; i < GetWorlds().length; i++) {
      if (GetWorlds()[i].mapList.includes(mapNumber)) {
        targetWorld = i
        break;
      }
    }
    setDialogState({ ...dialogState, 
                    selectedMap: mapNumber, 
                    activeWorld: targetWorld, 
                    selectedNpc: newNpcSelection,
                    findMap: mapNumberIndex,
                    popupsState: null});
  }
  const onSelectMap = (evt, manNumber) => {
    if (evt.button === MouseButtons.right)
    {
      window.parent.BabelUI.RequestAction(Actions.TeleportToMap, manNumber)
    }
    setDialogState({ ...dialogState, selectedMap: manNumber});
  }
  const openNpcSearch = evt => {
    setDialogState({ ...dialogState, popupsState:'find-npc'});
  }
  const onCloseNpcFind = evt => {
    setDialogState({ ...dialogState, popupsState:null});
  }
  if (selectedMap === -1) {
    updateSelectedMapAndNpc(userMap, selectedNpc)
  }
  const userPos = useSelector(selectCurrentCoordinates)
  return (
    <AoDialog styles='world-map' contentStyles='content'>
      <div className='header-line'>
        <div className='header-content'>
          <img src={require('../../../../assets/Icons/Dialogs/WorldmapIcon.png')}/>
          <h1 className='game-dialog-header'>{t('world map').toUpperCase()}</h1>
        </div>
        <span className='header-underline'></span>
        <div className='header-navbar'>
          <div className='continent'>
            <h2 className='continent-title'>{t('Continent')}</h2>
            <div className='continent-selector'>
            {
              Worlds.map( world => (
                <AoButton key={world.index} 
                  styles={'testcheck stats-opt-button ' + (activeWorld === world.index ? 'selected' : 'unselected')} 
                  onClick={() => onChangeWorld(world)}>
                    <span className='world-name'>{t(world.name)}</span>
                </AoButton>
              ))
            }
            </div>
          </div>
          <div className='search'>
            <h2 className='search-title'>{t('Search zone')}</h2>
            <div className='search-input--container'>
              <AoInput name="findMap" type="number" styles='search-input search-selected'
                showDelete={findMap !== null}
                min="1" max="10000" value={findMap} IsValid={true} handleChange={updateMapSearch} />
            </div>
          </div>
        </div>
      </div>
      <AoButton styles='close-button' onClick={onClose}>
        <img src={require('../../../../assets/Icons/gameplay/ico_close.png')}></img>
      </AoButton>
      <div className='map-content-area'>
        <div className='map-area'>
          <div className='world-selector'>
            {
              Worlds.map( world => (
                <AoButton key={world.index} styles={'stats-opt-button ' + (activeWorld === world.index ? 'selected' : 'unselected')} onClick={() => onChangeWorld(world)}>{t(world.name).toUpperCase()}</AoButton>
              ))
            }
          </div>
          <Frame styles='map-grid-frame' contentStyles='map-grid'>
            <img src={GetWorldImage(`es_mapa${activeWorld + 1}`)} style={mapImageStyle} />
            <div className='grid-layer' style={gridStyle}>
              {
                grid.map( (mapNumber, index) => (
                  <span key={index} 
                    className={'grid-element ' + getBackgroundStyle(displaySafeUnsafe, 
                                                                    selectedGrid.mapDetails[mapNumber], 
                                                                    mapNumber === selectedMap, 
                                                                    mapNumber,
                                                                    clanSignal)} 
                    onClick={(evt) => onSelectMap(evt, mapNumber)}
                    style={cellSize}>
                    { 
                      clanSignal && clanSignal.map === mapNumber && 
                      <MapMarker posX={clanSignal.tileX} posY={clanSignal.tileY} color={1}/>
                    }
                    { 
                      userMap === mapNumber && 
                      <MapMarker posX={userPos.x} posY={userPos.y} color={2}/>
                    }
                    {
                      showMapNumbers && !IgnoreMapNumber(mapNumber) && <p className='grid-number'>{mapNumber}</p>
                    }
                  </span>
                ))
              }
            </div>
          </Frame>
        </div>
        <div className='side-bar-area'>
          <h2 className='zone-title'>{t('Current zone')}</h2>
          <p className='zone-name'>{selectedMapDetails && selectedMapDetails.name} ({selectedMap})</p>
          <FrameMap contentStyles='npc-info'>
            {
              selectedMapDetails && selectedMapDetails.npcList.length > 0 ?
              <>
                <div className='npc-list-title'>
                  <span className='npc-list-name npc-header-line'>{t('Npcs')}</span>
                  <span className='npc-list-count npc-header-line'>{t('Amount')}</span>
                </div>
                {
                selectedMapDetails.npcList.map( (npcEntry) => (
                  <div key={npcEntry.index} className={'npc-list-title ' + ( selectedNpc === npcEntry.index ? 'selected-npc' : '')} 
                       onClick={ () => selectNpc(npcEntry)}>
                    <span  className='npc-list-name'>{npcEntry.name}</span>
                    <span className='npc-list-count'>{npcEntry.count}</span>
                  </div>
                  ))
                }
              </>
              :
              <p className='no-npc-found'>{t('no-npc-found')}</p>
            }
          </FrameMap>
          <p className='npc-details-tittle'>{t('Details')}</p>
          <FrameMap contentStyles='npc-info npc-details-frame'>
            {
              selectedNpcDetails && <NpcDetails npcDetails={selectedNpcDetails}/>
            }
          </FrameMap>


          <div className='npc-preview-container'>
            <FrameNpc contentStyles='npc-preview'>
              { selectedNpcDetails && <NpcPreview npcDetails={selectedNpcDetails} /> }
            </FrameNpc>
          </div>

          <AoButton styles='search-npc-button' onClick={openNpcSearch}>{t('Search NPC')}</AoButton>
              <p className='npc-details-tittle markers-title'>{t('Markers')}</p>
          <FrameMap styles='markers-frame'>
            <div className='markers-container'>
              <div className='markers-content--container'>
                <AoCheckbox label={t('Map numbers')}
                  name="showMapNumbers"
                  styles='markers-ops'
                  labelStyle='marker-label'
                  handleChange={ (evt) => handleChange(evt, !showMapNumbers)}
                  state={showMapNumbers} />
                <AoCheckbox label={t('Safe-unsafe')}
                  name="displaySafeUnsafe"
                  styles='markers-ops'
                  labelStyle='marker-label'
                  handleChange={(evt) => handleChange(evt, !displaySafeUnsafe)}
                  state={displaySafeUnsafe} />
              </div>
            </div>
          </FrameMap>
        </div>
      </div>
      <ErrorBoundary compName="map popups">
        {
          popupsState ?
          <div className='popups'>
            {{
                'find-npc':<FindNpc styles='centered' onClose={onCloseNpcFind} worldInfo={GetWorlds()} onSelectMap={updateSelectedMapAndNpc}/>
              }
              [popupsState]
            }
          </div> :
          null
        }
        </ErrorBoundary>
    </AoDialog>
  )
}