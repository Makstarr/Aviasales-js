const formSearch = document.querySelector('.form-search'),
cheapestTicket = document.querySelector('#cheapest-ticket'),
otherCheapTickets = document.querySelector('#other-cheap-tickets'),
inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
inputCitiesTo = formSearch.querySelector('.input__cities-to'),
dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
inputDateDepart = formSearch.querySelector('.input__date-depart');


const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
      localCopycitiesApi = './cities.json',
      proxy = 'https://cors-anywhere.herokuapp.com/',
      apiKey = 'd61720d70f3bf3fa8ef106bcfae844c6',
      calendar = 'http://min-prices.aviasales.ru/calendar_preload',
      numberOfOtherTickets = 6,
      numberOfPasanger = 1; 
let cities = [],
    apiRequestData = "";


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
            alert('Такого варианта нет')
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
        hour: 'numeric',
        minute: 'numeric'
    })
}

const getLinkAvisales = (data) =>
{
    let day = new Date(data.depart_date).getDate()
    let month =  new Date(data.depart_date).getMonth() + 1
    return `https://www.aviasales.ru/search/${data.origin}${day<10?'0'+day:day}` +
    `${month<10?'0'+month:month}${data.destination}${numberOfPasanger}`
}
const createCart = (data) =>{
    const article = document.createElement('article');
    article.classList.add('ticket');
    let deep = '';
    deep = data?
    `<h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
        <div class="left-side">
            <a href="${getLinkAvisales(data)}" class="button button__buy">Купить
                за ${data.value}₽</a>
        </div>
        <div class="right-side">
            <div class="block-left">
                <div class="city__from">Вылет из города
                    <span class="city__name">${getCityName(data.origin)}</span>
                </div>
                <div class="date">${getDate(data.depart_date)}</div>
            </div>
    
            <div class="block-right">
                <div class="changes">${
                    data.number_of_changes===1?"Одна пересадка":
                    data.number_of_changes===2?"Две пересадки":
                    "Без пересадок"}
                </div>
                <div class="city__to">Город назначения:
                    <span class="city__name">${getCityName(data.destination)}</span>
                </div>
            </div>
        </div>
    </div>`
    :'<h3>Нет билетов на выбранную дату!</h3>';
    article.insertAdjacentHTML('afterbegin', deep)
    return article;

};

const renderTickets = (tickets) => {
    tickets.sort((a, b) => a.depart_date<b.depart_date?-1:a.depart_date>b.depart_date?1:0)
    const firstFive = tickets.sort((a, b)  => a.value-b.value).slice(0,100);
    otherCheapTickets.innerHTML = '<h2>Самый дешевый билет</h2>';
    otherCheapTickets.append(createCart(firstFive[0]));
    firstFive.sort((a, b) => a.depart_date<b.depart_date?-1:a.depart_date>b.depart_date?1:0 ).slice(0,5);
    otherCheapTickets.style.display ='block';
    otherCheapTickets.insertAdjacentHTML('beforeend', '<h2>Ближайшие дешевые билеты</h2>');
    let num = 0;
    while(num<numberOfOtherTickets&&num<=tickets.length){
        otherCheapTickets.append(createCart(firstFive[num]));
        num+=1;
    }
};

const renderChipTicket = (ticket) => {
    cheapestTicket.style.display ='block';
    cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';
    cheapestTicket.append(createCart(ticket[0]));
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

const renderTicket = (data, date) => {
    const tickets = JSON.parse(data).best_prices,
    chipTicketToDate = tickets.filter((item) => {
        return item.depart_date == date
    });
    renderChipTicket(chipTicketToDate);
    renderTickets(tickets);
}


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
    const formData = {
        from: cities.find((item)=>inputCitiesFrom.value === ( item.name + " " + item.code)),
        to: cities.find((item)=>inputCitiesTo.value === (item.name + " " + item.code)),
        date: inputDateDepart.value
    }
    if (formData.from && formData.to){
        apiRequestData = `?depart_date=${formData.date}&origin_iata=${formData.from.code}` +
        `&destination_iata=${formData.to.code}&one_way=true&token=${apiKey}`
        getData(proxy + calendar+apiRequestData, (response) => {
            renderTicket(response, formData.date);
        });
    } else {
        alert ("Ошибка в названии города!")
    }
});


getData(proxy+citiesApi, (api) => {
    cities = JSON.parse(api).filter((item) => item.name);
    cities.sort((a, b) => a.name<b.name?-1:a.name>b.name?1:0 );
});