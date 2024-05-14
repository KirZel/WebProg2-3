function clearTable(idTable){
  let table = document.getElementById(idTable);
  table.innerHTML = ''; 
}

function DateChangeForm(data1){
  let newdate;
  newdate = data1.substring(6,10) + '-' + data1.substring(3,5) + '-' + data1.substring(0,2);
  return newdate;
}

let createTable = (data, idTable) => {
  let table = document.getElementById(idTable);

  let rowH = document.createElement("tr");
  for (let key in data[0]) {
    let th = document.createElement("th");
    th.innerHTML = key;
    rowH.appendChild(th);
    console.log(rowH);
  }
  table.appendChild(rowH);

  data.forEach(item => {
    let rowD = document.createElement("tr");
    for (let key in item) {
      let td = document.createElement("td");
      td.innerHTML = item[key];
      rowD.appendChild(td);
      console.log(rowD);
    }
    table.appendChild(rowD);
  });
};

let correspond = {
	"Номер ИМО судна" : "IMO",
	"Модель судна" : "Model",
	"Тип судна" : "Type",
	"Дата прибытия" : "DataArrival",
	"Дата отбытия" : "DateDeparture",
	"Вместимость(в тоннах для грузовых и в людях для пассажирских)" : [ "CapacityFrom", "CapacityTo"], 
	"Нагруженность" :["LoadFrom", "LoadTo"]
}

let dataFilter = (dataForm) => {
  let dictFilter = {};

  // Перебираем все элементы формы с фильтрами
  for (let j = 0; j < dataForm.elements.length; j++) {
    let item = dataForm.elements[j];
    let valInput = item.value;

    if (item.type == "text") {
      valInput = valInput.toLowerCase();
    } 
    else
    if (item.type == "number") {
      if (valInput === "" && item.id.includes("From")) {
        valInput = -Infinity;
      }
      else if (valInput === "" && item.id.includes("To")) {
        valInput = Infinity;
      }
      else {
        valInput = parseFloat(valInput);
      }
    }
	else if (item.type == "date") {

	}

    dictFilter[item.id] = valInput;
    console.log(dictFilter[item.id]);
  }
  
  return dictFilter;
};


let filterTable = (data, idTable, dataForm) => {
	
	console.log('Начинаю фильтрацию');

  let datafilter = dataFilter(dataForm);

  let tableFilter = data.filter(item => {
    let result = true;

    for (let key in item) {
      let val = item[key];
		
	    if (key === "Номер ИМО судна" || key === "Модель судна")
	   {
	    	val = item[key].toLowerCase()
        result &&= val.indexOf(datafilter[correspond[key]]) !== -1;
    	}

	    else if (typeof val == "number") {  
		
        if(key === "Вместимость(в тоннах для грузовых и в людях для пассажирских)") {
          let fromValue = datafilter[`CapacityFrom`];
          let toValue = datafilter[`CapacityTo`];
          result &&= val >= fromValue && val <= toValue;
        }

        if (key === "Нагруженность") {
          let fromValue = datafilter[`LoadFrom`];
          let toValue = datafilter[`LoadTo`];
          result &&= val >= fromValue && val <= toValue;
        }
     } 

	     if (key === "Дата прибытия")
	      {
          result &&= (DateChangeForm(val) == datafilter[`DataArrival`]) || (datafilter[`DataArrival`] == '');
		    	console.log(result, DateChangeForm(val), key, datafilter[`DataArrival`]);
        }

      if (key ==="Дата отбытия") {
        result &&= (DateChangeForm(val) == datafilter[`DateDeparture`]) || (datafilter[`DateDeparture`] == '');
        console.log(result, DateChangeForm(val), key, datafilter[`DateDeparture`]);
      }

     
	  }
    
    return result;
  });
  
    clearTable(idTable);
    createTable(tableFilter, idTable);
  	console.log('Фильтрация окончена');
}

  function clearFilter(){
  let filterForm = document.getElementById('filterForm');
  let filterInputs = filterForm.getElementsByTagName('input');
  for (let i = 0; i < filterInputs.length; i++) {
    if (filterInputs[i].type === 'text' || filterInputs[i].type === 'number') {
      filterInputs[i].value = '';
    }
  }
  clearTable('list');
  createTable(portData,'list')
}


let createOption = (str, val) => {  
  let item = document.createElement('option'); 
  item.text = str;  
  item.value = val; 
  return item; 
}

let setSortSelect = (head, sortSelect) => {  
  // создаем OPTION Нет и добавляем ее в SELECT  
  sortSelect.append(createOption('Нет', 0)); 
  // перебираем все ключи переданного элемента массива данных 
  for (let i in head) {  
      sortSelect.append(createOption(head[i], Number(i) + 1)); 
  } 
} 
let setSortSelects = (data, dataForm) => { 
  // выделяем ключи словаря в массив  
  let head = Object.keys(data[0]); 
  // находим все SELECT в форме  
  let allSelect = dataForm.getElementsByTagName('select'); 
  for(let j = 0; j < allSelect.length; j++) { 
      //формируем опции очередного SELECT  
      setSortSelect(head, allSelect[j]); 
      if (j > 0) {
          allSelect[j].disabled = true;
      }
  }
}

let changeNextSelect = (nextSelectId, curSelect, predValue) => {
  console.log(curSelect.value);
  let nextSelect = document.getElementById(nextSelectId);
 
  nextSelect.disabled = false;
 
  // в следующем SELECT выводим те же option, что и в текущем
  nextSelect.innerHTML = curSelect.innerHTML;
 
  // удаляем в следующем SELECT уже выбранную в текущем опцию
  // если это не первая опция - отсутствие сортировки
  if (curSelect.value != 0) {
    if (predValue < curSelect.value){
      nextSelect.remove(curSelect.value-1);
      console.log('Working',predValue);
    } else nextSelect.remove(curSelect.value);
  } else {
  nextSelect.disabled = true;
  }
}

let createSortArr = (data) => { 
  let sortArr = []; 
  
  let sortSelects = data.getElementsByTagName('select'); 
  
  for (let i = 0; i < sortSelects.length; i++) { 
      // получаем номер выбранной опции 
      let keySort = sortSelects[i].value; 
      // в случае, если выбрана опция Нет, заканчиваем формировать массив 
      if (keySort == 0) { 
          break; 
      } 
      // получаем номер значение флажка для порядка сортировки 
      // имя флажка сформировано как имя поля SELECT и слова Desc 
      let desc = document.getElementById(sortSelects[i].id + 'Desc').checked; 
      sortArr.push({column: keySort - 1, order: desc}); 
  } 
  return sortArr; 
};
 
let sortTable = (idTable, form) => {     
  // Формируем массив с настройками сортировки из переданной формы
  let sortArr = createSortArr(form); 
  
  // Если массив с настройками пуст, то возвращаем false, так как сортировка не требуется
  if (sortArr.length === 0) { 
      return false;     
  } 

  // Находим таблицу по ее ID
  let table = document.getElementById(idTable);     

  // Преобразуем строки таблицы в массив и удаляем первую строку с заголовками
  let rowData = Array.from(table.rows); 
  rowData.shift(); 

  // Сортируем данные на основе массива с настройками сортировки
  rowData.sort((first, second) => {         
      for(let i in sortArr) { 
          let key = sortArr[i].column;             
          let sortOrder = sortArr[i].order ? -1 : 1; // Если порядок сортировки true, то sortOrder = -1, иначе 1
          if (key == 5 || key == 6){
            if (+first.cells[key].innerHTML > +second.cells[key].innerHTML) {                 
              return 1 * sortOrder; 
          } else if (+first.cells[key].innerHTML < +second.cells[key].innerHTML){
              return -1 * sortOrder; 
          }  
          }
          else {
          if (first.cells[key].innerHTML > second.cells[key].innerHTML) {                 
              return 1 * sortOrder; 
          } else if (first.cells[key].innerHTML < second.cells[key].innerHTML){
              return -1 * sortOrder; 
          }    
        }     
      } 
      return 0; // Если элементы равны, сохраняем текущий порядок
  }); 

  // Заменяем содержимое таблицы отсортированными данными
  table.innerHTML = table.rows[0].innerHTML;

  // Добавляем отсортированные строки обратно в таблицу
  rowData.forEach(item => {         
      table.append(item); 
  }); 
};

function sortReset() {
  document.getElementById("select1Desc").checked = false;
  document.getElementById("select2Desc").checked = false;
  document.getElementById("select3Desc").checked = false;
  document.getElementById("select2").disabled = true;
  document.getElementById("select3").disabled = true;
  document.getElementById("select1").value = 0;
  document.getElementById("select2").value = 0;
  document.getElementById("select3").value = 0;
  clearTable('list');
  createTable(portData,'list');
}


document.addEventListener("DOMContentLoaded", function() {
 createTable(portData, 'list');
 setSortSelects(portData, document.getElementById('sort'))
})

document.getElementById('select1').addEventListener('change', function() {
  let curSelect = this;
  changeNextSelect('select2', curSelect);
  changeNextSelect('select3', curSelect);
  document.getElementById('select3').disabled = true;
  console.log('Меняю селект2');
})

document.getElementById('select2').addEventListener('change', function() {
  let nextSelectId = 'select3'; 
  let curSelect = this;
  changeNextSelect(nextSelectId, curSelect, document.getElementById('select1').value);
  console.log('Меняю селект3');
})