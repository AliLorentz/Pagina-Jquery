(async function load() {


  const BASE_API = 'https://yts.am/api/v2/';
  const $overlay = document.getElementById('overlay');
  const $modal = document.getElementById('modal');
  const $hideModal = document.getElementById('hide-modal');
  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');


  //
  // ────────────────────────────────────────────────────────────────── GETDATA ─────
  //
  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (data.data.movie_count > 0) {
      // aqui se acaba
      return data;
    }
    // si no hay pelis aquÃ­ continua
    throw new Error('No se encontrÃ³ ningun resultado');
  }

  async function getUserData(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (data.info.results > 0) {
      return data;
    }
    throw new Error('No hay amigos ajia');
  }
  // ────────────────────────────────────────────────────────────────────────────────

  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
  const $featuringContainer = document.getElementById('featuring');


  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }


  function featuringTemplate(peli) {
    return (
      `
      <div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      </div>
      `
    )
  }

  /**Agregamos Template para las fotos de cada categoria */
  function videoItemTemplate(movie, category) {
    return (
      `
      <div class="primaryPlaylistItem" data-id="${movie.id}" data-category=${category}>
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>
      `
    )
  }


  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  /**Agregamos el Modal */
  function addEventClick($element) {
    $element.addEventListener('click', () => {
      //  alert('click')
      showModal($element)
    })
    $featuringContainer
  }

  function renderMovieList(list, $container, category) {
    // actionList.data.movies
    $container.children[0].remove(); //Quita el simbolo de recarga
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);

      /**Click para el MODAL */
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      })
      addEventClick(movieElement);
    })
  }
  //
  // ─────────────────────────────────────────────────────────────────────────  ─────
  //
  function friendTemplate(fr) {
    // console.log(fr);
    return (`
  <li class="playlistFriends-item" data-email="${fr.email}">
  <a href="#">
    <img src="${fr.picture.thumbnail}"/>
    <span>
      ${fr.name.first} ${fr.name.last}
    </span>
  </a>
  </li>
  `);
  }

  function addfriendClick($element) {
    $element.addEventListener('click', () => {
      showModal2($element)
    })
  }


  function renderFriendList(list, $container) {
    list.forEach((fr) => {
      const HTMLString = friendTemplate(fr);
      const friendElement = createTemplate(HTMLString);
      $container.append(friendElement);

      addfriendClick(friendElement);

    })

  }

  const USERS_API = 'https://randomuser.me/api/?results=10';
  const {
    results: usersList
  } = await getUserData(USERS_API);

  const $friendList = document.getElementById('playList');
  renderFriendList(usersList, $friendList)


  /*Agraga la imagen de busqueda*/
  /*_______________________________________________________________________*/

  function showModalFind(data) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';

    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full
  }

  $form.addEventListener('submit', async (event) => {
    event.preventDefault(); //No Se recargue la pagina
    $home.classList.add('search-active')
    /*Crea una imagen y lo agrega al final de la carga*/
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    })
    $featuringContainer.append($loader);
    /*Fin de agregar una imagen*/
    const data = new FormData($form);
    try {
      const {
        data: {
          movies: pelis
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;

      const infoElement = pelis[0];
      showModalFind(infoElement);

    } catch (error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  })
  //
  // ─────────────────────────────────────────────────────────────────────────  ─────
  //


  const {
    data: {
      movies: actionList
    }
  } = await getData(`${BASE_API}list_movies.json?genre=action`)
  // window.localStorage.setItem('actionList',JSON.stringify(actionList));
  const $actionContainer = document.querySelector('#action');
  renderMovieList(actionList, $actionContainer, 'action');

  const {
    data: {
      movies: dramaList
    }
  } = await getData(`${BASE_API}list_movies.json?genre=drama`)
  const $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const {
    data: {
      movies: animationList
    }
  } = await getData(`${BASE_API}list_movies.json?genre=animation`)
  const $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, 'animation');


  // const $home = $('.home .list #item');

  //
  // ───────────────────────BUSCAMOS LA PELICULA PARA EL MODAL────────────────────────────────────  ─────
  //

  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category) {
    switch (category) {
      case 'action':
        {
          return findById(actionList, id)
        }
      case 'drama':
        {
          return findById(dramaList, id)
        }
      default:
        {
          return findById(animationList, id)
        }
    }
  }

  /*Muestra el modal cuando damos click en una imagen con su informacion */
  function showModal($element) {

    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';

    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    // console.log(data);
    $modalTitle.textContent = data.title;

    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full
  }

  //
  // ─────────────────────────────────────────────────────────────────────────  ─────
  //


  function findUser(email) {
    return usersList.find(user => user.email === email);
  }

  function showModal2($element) {
    // console.log($element);
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';

    const email = $element.dataset.email;
    const data = findUser(email);

    $modalImage.setAttribute('src', data.picture.large);
    $modalTitle.textContent = `${data.name.first} ${data.name.last}`;
    const detailsString =
      `
            <p style="padding-left: 20px; text-align: left;">
            <strong>Género</strong><br/>
            ${data.gender}<br/><br/>

            <strong>Email</strong><br/>
            ${data.email}<br/><br/>

            <strong>Locación</strong><br/>
            ${data.location.city}, 
            ${data.location.state}, 
            ${data.location.postcode}
            </p>
            `
    $modalDescription.textContent = "";
    $modalDescription.innerHTML = detailsString;


  }


  $hideModal.addEventListener('click', hideModal);

  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';

  }




})()