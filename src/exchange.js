/// <reference types="jquery" />

const $baseCurrency = document.querySelector('#base-currency');
const $latestRatesCheck = document.querySelector('#latest-rates');
const $userDate = document.querySelector('#user-date');
// Format is in YYYY/MM/DD. Use $userDate[0].value in console to check value of the inputted date.
const $userAmount = document.querySelector('#user-amount');
const $loadingMessage = document.querySelector('#loading-message');
const $confirm = document.querySelector('#confirm');
const $reset = document.querySelector('#reset');
const $currencyList = document.querySelector('#currency-list');
const $exchangeRates = document.querySelector('#exchange-rates');
const $results = document.querySelector('#results');
const $errors = document.querySelector('#errors');
const baseURL = 'https://api.exchangerate.host';

$confirm.setAttribute('disabled', true);

$latestRatesCheck.onclick = () => {
  if ($latestRatesCheck.checked === true) {
    $userDate.setAttribute('disabled', true);
  } else {
    $userDate.removeAttribute('disabled');
  }
};

function obtainExchanges(base = 'EUR', date = 'latest') {
  return fetch(`${baseURL}/${date}?base=${base}`)
    .then((r) => r.json())
    .then((r) => r.rates);
}

function deleteAllLists(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

$baseCurrency.oninput = () => {
  if ($baseCurrency.value === '') {
    $confirm.setAttribute('disabled', true);
  } else {
    $confirm.removeAttribute('disabled');
  }
};

function validateCurrencyInput() {
  const baseCurrency = String($baseCurrency.value).toUpperCase();
  $loadingMessage.classList.remove('hidden');
  return fetch('https://api.exchangerate.host/symbols')
    .then((response) => response.json())
    .then((data) => {
      if (baseCurrency in data.symbols) {
        $loadingMessage.classList.add('hidden');
        return '';
      }
      $loadingMessage.classList.add('hidden');
      return 'Please insert a valid currency.';
    })
    .catch((error) => {
      console.error(error);
      return 'An error has occured. Check the console for more information.';
    });
}

function validateAmountInput(amount) {
  const errors = [];
  // eslint-disable-next-line no-param-reassign
  amount = amount.trim();
  if (amount.length > 6) {
    errors.push('The currency amount must be less than 6 digits long.');
  }
  if (amount < 0) {
    errors.push('The currency amount cannot be a negative number.');
  }
  if (!/^[0-9]+$|^$|^\s$/.test(amount)) {
    errors.push('The currency amount only accepts numbers.');
  }
  return errors;
}

function troubleshooting(errors) {
  const $errorsList = document.createElement('ul');
  $errorsList.className = 'errors-list';
  const keys = Object.keys(errors);
  $errors.classList.remove('hidden');

  deleteAllLists($errors);

  keys.forEach((key) => {
    const errorList = errors[key];
    if (errorList) {
      errorList.forEach((error) => {
        if (error !== '') {
          const $error = document.createElement('li');
          $error.innerText = error;
          $error.classList.add('text-danger');
          $errorsList.appendChild($error);
        }
      });
    }
  });

  $errors.appendChild($errorsList);
}

$confirm.onclick = async () => {
  const baseCurrency = $baseCurrency.value;
  const userAmount = $userAmount.value;
  let validationResults = [];
  const $errorMessage = document.querySelector('#error-message');
  $results.classList.add('hidden', 'invisible');
  $errors.classList.add('hidden');

  deleteAllLists($currencyList);
  deleteAllLists($exchangeRates);
  const fetchCurrencyStatus = await validateCurrencyInput(baseCurrency);
  const userCurrencyAmount = validateAmountInput(userAmount);
  if (fetchCurrencyStatus === 'An error has occured. Check the console for more information.') {
    $errorMessage.querySelector('#error-message').textContent = fetchCurrencyStatus;
    $errorMessage.classList.remove('hidden');
  } else {
    validationResults.push(fetchCurrencyStatus);
  }

  validationResults = validationResults.concat(userCurrencyAmount);

  if (!validationResults.every((result) => result === '')) {
    const errors = {
      errorAmount: validationResults,
    };
    troubleshooting(errors);
  } else {
    let userDate;

    if ($latestRatesCheck.checked === false) {
      userDate = $userDate.value;
    } else {
      userDate = 'latest';
    }

    $loadingMessage.classList.remove('hidden');

    obtainExchanges(baseCurrency, userDate).then((rates) => {
      $loadingMessage.classList.add('hidden');
      $results.classList.remove('hidden', 'invisible');
      $currencyList.innerHTML = 'Currency list:';
      $exchangeRates.innerHTML = 'Exchange rates:';

      Object.keys(rates).forEach((currency) => {
        let exchangeRate = rates[currency];
        const currencyEl = document.createElement('p');
        const exchangeRateEl = document.createElement('p');
        if ($userAmount.value > 1) {
          exchangeRate *= $userAmount.value;
          exchangeRate = parseFloat(exchangeRate.toFixed(2));
        }
        currencyEl.textContent = currency;
        exchangeRateEl.textContent = exchangeRate;
        currencyEl.classList.add('border', 'border-primary');
        exchangeRateEl.classList.add('border', 'border-primary');
        $currencyList.appendChild(currencyEl);
        $exchangeRates.appendChild(exchangeRateEl);
      });
    })
      .catch((error) => {
        $loadingMessage.classList.add('hidden');
        document.querySelector('#error-message').innerHTML = error.message;
      });
  }
};

function configureInputDate() {
  const today = (new Date()).toISOString().split('T')[0];
  const minDate = new Date('2000-01-01').toISOString().split('T')[0];
  $userDate.setAttribute('max', today);
  $userDate.setAttribute('min', minDate);
  $userDate.value = today;
}

$reset.onclick = () => {
  $errors.classList.add('hidden');
  deleteAllLists($currencyList);
  deleteAllLists($exchangeRates);
  $results.classList.add('hidden', 'invisible');
  configureInputDate();
  $baseCurrency.value = '';
  $latestRatesCheck.checked = false;
  $userAmount.value = '';
};

configureInputDate();
