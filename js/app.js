class Character {
    // el constructor recibe un objeto literal, para poder realizar el
    // operador spread
    constructor({ id, firstName, lastName, title, imageUrl, family }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.title = title;
        this.imageUrl = imageUrl;
        this.family = family;
    }

    // los getters no se invocan, se comportan como propiedades
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
}

const mainEL = document.querySelector('main');
const searchInput = document.querySelector('#search');
const clearEl = document.querySelector('#clear');
const familiesSelect = document.querySelector('#families');

let characters = [];
let filteredData = [];
let families = [];


// predicados son funciones que retornan un valor booleano
const isSearchResult = (query, character) => character.fullName.toLowerCase().includes(query.toLowerCase());
const isSameFamily = (character, family) => character.family === family;
const isSearchResultAndIsSameFamily = (query, character, family) => isSameFamily(character, family) && isSearchResult(query, character);


const getData = async () => {
    const response = await fetch('https://thronesapi.com/api/v2/Characters');
    const data = await response.json();
    // map comunmente se usa para transformar un array en un nuevo array    
    // new Character({ ...character }) se esparce el objeto y como el constructor
    // recibe un objeto literal, omite los atributos que no coincidan con los parametros
    // characters = data.map(character => new Character({  id: character.id, firstName: character.firstName  }));
    characters = data.map(character => new Character({ ...character }));
    filteredData = characters;
    generateSelect(characters);
    renderData(filteredData);
}

const generateSelect = (data = []) => {
    // [acc] acumulador, [current]elemento actual en la iteracion
    families = data.reduce((acc, current) =>
        // si el elemento actual no esta en el acumulador o no esta vacio
        (!acc.includes(current.family) && current.family) ?
            //  si se cumple la condicion se crea un nuevo array con lo que hay en el acumulador y el elemento actual 
            // si no se retorna el acumulador
            [...acc, current.family] : acc,
        // valor inicial
        ['All']);
    families.sort();
    fillSelect(families);
}

const renderData = (data = []) => {
    // con [!data.length] se puede comprobar si el array no tiene elementos 
    if (!data.length) {
        mainEL.innerHTML = `<div class='not_found'> <h2>No results found</h2>  </div> `;
        return;
    }

    // se genera por cada item un fragmento de html
    const html = data.map(character => `
        <div class="card animate__animated animate__fadeIn">
            <img src="${character.imageUrl}" alt="${character.fullName}">
            <div class="description">
                <h3>${character.fullName}</h3>
                <span>${character.title}</span>
            </div>
        </div>
    `).join('');

    // se agrega el fragmento de html al main
    mainEL.innerHTML = html;
}

const fillSelect = (data = []) => {
    const html = data.map(family => `<option value="${family}">${family}</option>`).join('');
    familiesSelect.innerHTML = html;
}

const reset = () => {
    searchInput.value = '';
    filteredData = characters;
    const family = familiesSelect.value;
    // se construye como si fuera un evento de input
    filterDataByFamily({ target: { value: family } });
}

const filterData = (e) => {
    const query = e.target.value;
    const family = familiesSelect.value;
    if (family == 'All') {
        // se pasan a lowecase para filtrar independientemente de si se escribe en mayusculas o minusculas
        filteredData = characters.filter(character => isSearchResult(query, character));
    } else {
        filteredData = characters.filter(character =>
            isSearchResultAndIsSameFamily(query, character, family));
    }
    renderData(filteredData);
}

const filterDataByFamily = (e) => {
    const query = searchInput.value;
    const family = e.target.value;
    if (family == 'All') {
        filteredData = characters.filter(character =>
            isSearchResult(query, character));
    } else {
        filteredData = characters.filter(character =>
            isSearchResultAndIsSameFamily(query, character, family));
    }
    renderData(filteredData);
}

searchInput.addEventListener('input', filterData);

// las firmas no coinciden pero esto solo funciona en javascript
clearEl.addEventListener('click', reset);

familiesSelect.addEventListener('change', filterDataByFamily);

getData();
