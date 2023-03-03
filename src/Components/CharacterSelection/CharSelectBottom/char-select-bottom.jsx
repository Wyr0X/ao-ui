import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectCharacter, selectSelectedCharacter } from '../../../redux/CharSelectionSlice';
import { GetColorForCharacterStatus, GetNameForClassId } from '../../../Tools/Utils';
import LoginButton from '../LogInButton/login-button'
import './char-select-bottom.scss'

export default function CharSelectBottom() {
  const { t } = useTranslation();
  const selectedCharacter = useSelector(selectSelectedCharacter)
  const loginEnabled = selectCharacter != null
  const nameColor = GetColorForCharacterStatus(selectedCharacter.status)
  const doLogin = event => {

  }

  const createCharacter = event => {

  }
  return (
    <div className='char-selection-bottom'>
      <div className='character-details'>
        <div className='section-divider'></div>
        <div className='section-divider'>
          <div className='seleccion-detais'>
             <div className='details-border-left'></div>
             <div className='details-box'>
             <div className='border-left'></div>
             <div className='text-area'>
               { selectedCharacter != null ? <p className={'text ' + nameColor}>{selectedCharacter.name}</p> : null }
               { selectedCharacter != null ? <p className='text'>{t('class', {className: t(GetNameForClassId(selectCharacter.class))})}</p> : null }
               { selectedCharacter != null ? <p className='text'>{t('level', { level: selectedCharacter.level})}</p> : null}
             </div>
             <div className='border-right'></div>
             </div>
             <div className='details-border-right'></div>
          </div>
        </div>
        <div className='section-divider'></div>
      </div>
      <div className='bottom-leather'>
      <div className='button-area'>
        <div className='bar-layer'>
          <div className='bar-img'></div>
        </div>
        <div className='button-layer'>
          <LoginButton onClick={createCharacter}>{t('create character').toUpperCase()}</LoginButton>
          <LoginButton disabled={!loginEnabled} isRed={true} onClick={doLogin}>{t('play').toUpperCase()}</LoginButton>
        </div>
      </div>
      </div>
    </div>
  )
}