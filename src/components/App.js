import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import DeleteConfirmPopup from './DeleteConfirmPopup';

function App() {

  // Переменные состояния, отвечающие за видимость попапов
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false)
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false)
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false)
  const [isDeleteConfirmPopupOpen, setIsDeleteConfirmPopupOpen] = useState(false)

  // Переменная состояния для выбраной карточки
  const [selectedCard, setSelectedCard] = useState({})

  // Переменная состояния для данных пользователя
  const [currentUser, setCurrentUser] = useState({ name: '', about: '', avatar: '' })

  // переменная состояния для карточек
  const [cards, setCards] = useState([])

  //переменная состояния для удаляемой карточки
  const [cardToDelete, setCardToDelete] = useState({})

  // переменная состояния, отвечающая за текст кнопок в формах
  const [isLoading, setIsLoading] = useState(false)

  // Обработчики событий для открытия попапов (при клике на кнопку)
  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true)
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true)
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true)
  }

  function handleDeleteClick(card) {
    setIsDeleteConfirmPopupOpen(true)
    setCardToDelete(card)
  }

  // Обработчик закрытия всех попапов
  function closeAllPopups() {
    setIsEditProfilePopupOpen(false)
    setIsAddPlacePopupOpen(false)
    setIsEditAvatarPopupOpen(false)
    setIsDeleteConfirmPopupOpen(false)

    // сбрасываем выбранные карточки
    setSelectedCard({})
    setCardToDelete({})
  }

  // Колбек для открытия карточки в фулскрин
  function handleCardClick(card) {
    setSelectedCard(card)
  }

  function handleUpdateUser({ name, about }) {
    setIsLoading(true)
    api.updateProfileInfo({ name: name, about: about })
      .then((res) => {
        // setCurrentUser({ name: res.name, about: res.about, avatar: res.avatar })
        setCurrentUser(res)
        closeAllPopups()
      })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  function handleUpdateAvatar({ avatar }) {
    setIsLoading(true)
    api.updateAvatar({ avatarLink: avatar })
      .then((res) => {
        setCurrentUser(res)
        closeAllPopups()
      })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // обработчик нажатия лайка
  function handleCardLike(card) {
    // Снова проверяем, есть ли уже лайк на этой карточке
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    // Отправляем запрос в API и получаем обновлённые данные карточки
    api.changeLikeCardStatus({ cardID: card._id, isLiked: isLiked })
      .then(
        (newCard) => {
          setCards(
            // создаем копию массива, заменив в нем измененную карточку
            cards.map(
              (cardElement) => cardElement._id === card._id ? newCard : cardElement
            )
          )
        })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
  }

  // обработчик удаления карточки
  function handleCardDelete(cardToDelete) {
    setIsLoading(true)
    api.deleteCardFromServer({ cardID: cardToDelete._id })
      .then(() => {
        setCards(
          // создаем копию массива, исключив из него удалённую карточку
          (state) => state.filter((item) => item._id !== cardToDelete._id)
        )
        closeAllPopups()
      })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // обработчик добавления карточки
  function handleAddPlaceSubmit(cardInfo) {
    setIsLoading(true)
    api.addNewCard(cardInfo)
      .then((res) => {
        // обновляем стейт cards с помощью расширенной копии текущего массива
        setCards([res, ...cards])
        closeAllPopups()
      })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  // эффект, вызываемый при монтировании компонента
  // будет совершать запрос в API за пользовательскими данными
  useEffect(() => {
    api.getProfileInfo()
      .then((res) => {
        // После получения ответа задаем полученные данные в соответствующие переменные состояния
        setCurrentUser(res)
      })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
  }, [])

  // запрашиваем начальные карточки
  useEffect(() => {
    api.getInitialCards()
      .then((res) => {
        // передаем карточки в переменную состояни
        setCards(res)
      })
      .catch((err) => {
        console.log(err) // выведем ошибку в консоль
      })
  }, [])

  // обработчик закрытия попапов по нажатию Escape
  const isOpen = isEditAvatarPopupOpen || isEditProfilePopupOpen || isAddPlacePopupOpen || selectedCard

  useEffect(() => {
    function closeByEscape(evt) {
      if (evt.key === 'Escape') {
        closeAllPopups();
      }
    }
    if (isOpen) { // навешиваем только при открытии
      document.addEventListener('keydown', closeByEscape);
      return () => {
        document.removeEventListener('keydown', closeByEscape);
      }
    }
  }, [isOpen])

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <Header />
        <Main
          onEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onEditAvatar={handleEditAvatarClick}
          onCardClickCallback={handleCardClick}
          cards={cards}
          onCardLike={handleCardLike}
          onCardDelete={handleDeleteClick}
        />
        <Footer />
        {/* Добавляю компонент попапов с children кодом внутри. Общая разметка, отличия приходят в компонент через children */}

        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onClose={closeAllPopups}
          onUpdateUser={handleUpdateUser}
          isLoading={isLoading} />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onClose={closeAllPopups}
          onUpdateAvatar={handleUpdateAvatar}
          isLoading={isLoading} />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onClose={closeAllPopups}
          onAddPlace={handleAddPlaceSubmit}
          isLoading={isLoading} />
        <DeleteConfirmPopup
          isOpen={isDeleteConfirmPopupOpen}
          onClose={closeAllPopups}
          onDeleteCard={handleCardDelete}
          cardToDelete={cardToDelete}
          isLoading={isLoading} />
        <ImagePopup
          card={selectedCard}
          onClose={closeAllPopups} />
      </div>
    </CurrentUserContext.Provider>
  )
}

export default App