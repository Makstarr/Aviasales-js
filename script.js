const formSearch = document.querySelector('.form-search'),
inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
inputCitiesTo = formSearch.querySelector('.input__cities-to'),
dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
inputDateDepart = formSearch.querySelector('.input__date-depart');

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
      localCopycitiesApi = './cities.json',
      proxy = 'https://cors-anywhere.herokuapp.com/';
let cities = [];

const getData = (url,callback) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', () => {
        if (request.readyState !==4) return;
        if (request.status ===200) {
            callback(request.response)
        }
        else {
            console.eror(request.status)
        }
    })

    request.send();
};

const showCity = (input,list) => {
    list.textContent = '';
    if (input.value==='') return
    const filterCity = cities.filter((item) => {
        if (item.name){
            const itemLowerCased = item.name.toLowerCase();
            return itemLowerCased.includes(input.value.toLowerCase());
        }
    })
    filterCity.forEach((item)=>{
        const li = document.createElement('li');
        li.classList.add('dropdown__city');
        li.textContent = item.name;
        list.append(li);
    });
};

const addFromList = (event,list,textField)=>{
    const target = event.target;
    if (target.tagName.toLowerCase() === 'li'){
        textField.value = target.textContent;
        list.textContent = '';
    }
};


inputCitiesFrom.addEventListener('input', () => showCity(inputCitiesFrom, dropdownCitiesFrom));
inputCitiesTo.addEventListener('input', () => showCity(inputCitiesTo, dropdownCitiesTo));
dropdownCitiesFrom.addEventListener('click', () => addFromList(event,dropdownCitiesFrom,inputCitiesFrom));
dropdownCitiesTo.addEventListener('click', () => addFromList(event,dropdownCitiesTo,inputCitiesTo));


getData(proxy+citiesApi, (api) => {
    cities = JSON.parse(api);
});