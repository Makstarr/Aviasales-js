// Получение html
const formSearch = document.querySelector('.search__form'),
cheapestTicket = document.querySelector('.favorite-tickets'),
otherCheapTickets = document.querySelector('.chip-tickets'),
inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
inputCitiesTo = formSearch.querySelector('.input__cities-to'),
dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
inputDateMin = formSearch.querySelector('.input__date-min'),
inputDateMax = formSearch.querySelector('.input__date-max'),
alert = document.querySelector('.header__allert');

// Переменные
const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
      localCopycitiesApi = './cities.json',
      proxy = 'https://cors-anywhere.herokuapp.com/',
      apiKey = 'd61720d70f3bf3fa8ef106bcfae844c6',
      calendar = 'http://min-prices.aviasales.ru/calendar_preload',
      numberOfPasanger = 1; 
let cities = [],
    apiRequestData = "";

// Фушкции
const getData = (url,callback,reject = console.error) => {
    const request = new XMLHttpRequest();

    request.open('GET', url);

    request.addEventListener('readystatechange', 
    () => {
        if (request.readyState !==4) return;
        if (request.status ===200) {
            callback(request.response);
        }
        else {
            alert.textContent = 'На выбранные даты вариантов нет';
            reject(request.status);
        }
    });
    request.send();
};

const getCityName = (code) => {
    return cities.find((item) => item.code === code).name;
}

const getDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const getLinkAvisales = (data) =>
{
    let day = new Date(data.depart_date).getDate()
    let month =  new Date(data.depart_date).getMonth() + 1
    return `https://www.aviasales.ru/search/${data.origin}${day<10?'0'+day:day}` +
    `${month<10?'0'+month:month}${data.destination}${numberOfPasanger}`
}
const createCart = (data, id) =>{
    const article = document.createElement('li');
    article.classList.add('ticket');
    article.id = id;
    let deep = '';
    deep = data?
    
    `<div class="ticket__left">
        <div class="ticket__agent">${data.gate}</div>
        <div class="ticket__rows">
            <div>
                <div class="city ticket__origin">Отправление из города ${getCityName(data.origin)}</div>
                <div class="city ticket__destination">Город назначения: ${getCityName(data.destination)}</div>
            </div>
            <div>
                <div class="ticket__date">${getDate(data.depart_date)}</div>
                <div class="ticket__changes">${
                    data.number_of_changes===1?"Одна пересадка":
                    data.number_of_changes===2?"Две пересадки":
                    "Без пересадок"}</div> 
            </div>
        </div>
    </div>
    <div class="ticket__right">
        <a href="#" class="button ticket__favorite" >В избранное</a>
        <a href="${getLinkAvisales(data)}" target="blanc" class="button ticket__buy" >Купить за ${data.value} р.</a>
    </div>`
    :'<h3>Нет билетов на выбранную дату!</h3>';
    article.insertAdjacentHTML('afterbegin', deep)
    return article;

};

const renderTickets = (tickets) => {
    const perfectTickets = tickets.filter((item) => {
        return new Date(item.depart_date)>=new Date(inputDateMin.value)&&new Date(item.depart_date)<=new Date(inputDateMax.value)
    });
    perfectTickets.sort((a,b)=>a.value-b.value)
    document.querySelector('.title-tickets').style.display ='block';
    otherCheapTickets.innerHTML = '';
    perfectTickets.forEach((item,i)=>otherCheapTickets.append(createCart(item,i)))
};

const showCity = (input,list) => {
    list.textContent = '';
    if (input.value==='') return
    const filterCity = cities.filter((item) => {
        const itemLowerCased = item.name.toLowerCase();
        return itemLowerCased.startsWith(input.value.toLowerCase());
    })
    filterCity.forEach((item)=>{
        const li = document.createElement('li');
        li.classList.add('dropdown__city');
        li.textContent = item.name + " " + item.code;
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

const handleCardMove = (event,listFrom,listTo)=>{
    if (event.target.innerHTML==='В избранное'){
        document.querySelector('.right__title').style.display='block';
        event.target.innerHTML='Убрать'
        listTo.append(event.target.parentElement.parentElement)
        return
    }
    if (event.target.innerHTML==='Убрать'){
        event.target.innerHTML='В избранное'
        listFrom.append(event.target.parentElement.parentElement)
        return
    }
};

const renderTicket = (data, date) => {
    const tickets = JSON.parse(data).best_prices,
    chipTicketToDate = tickets.filter((item) => {
        return item.depart_date == date
    });
    renderTickets(tickets);
}

// События
otherCheapTickets.addEventListener('click', 
() => handleCardMove(event,otherCheapTickets,cheapestTicket));
cheapestTicket.addEventListener('click', 
() => handleCardMove(event,otherCheapTickets,cheapestTicket));
inputCitiesFrom.addEventListener('input', 
() => showCity(inputCitiesFrom, dropdownCitiesFrom));
inputCitiesTo.addEventListener('input', 
() => showCity(inputCitiesTo, dropdownCitiesTo));
dropdownCitiesFrom.addEventListener('click', 
() => addFromList(event,dropdownCitiesFrom,inputCitiesFrom));
dropdownCitiesTo.addEventListener('click', 
() => addFromList(event,dropdownCitiesTo,inputCitiesTo));
document.querySelector('body').addEventListener('click',() => {dropdownCitiesFrom.innerHTML='',dropdownCitiesTo.innerHTML=''})
formSearch.addEventListener('submit',
(event)=>{
    event.preventDefault()
    alert.textContent = '';
    const formData = {
        from: cities.find((item)=>inputCitiesFrom.value === ( item.name + " " + item.code)),
        to: cities.find((item)=>inputCitiesTo.value === (item.name + " " + item.code)),
        date: inputDateMin.value
    }
    if (formData.from && formData.to){
        apiRequestData = `?depart_date=${formData.date}&origin_iata=${formData.from.code}` +
        `&destination_iata=${formData.to.code}&one_way=true`
        getData(proxy + calendar + apiRequestData, (response) => {
            renderTicket(response, formData.date);
        });
    } else {
        alert.textContent = "Ошибка в названии города!"
    }
});

// Запуск функций
getData(proxy + citiesApi, (api) => {
    cities = JSON.parse(api).filter((item) => item.name);
    cities.sort((a, b) => a.name<b.name?-1:a.name>b.name?1:0 );
});