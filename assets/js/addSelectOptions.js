const URL = 'https://jsonplaceholder.typicode.com/users';

export default async function addSelectOptions() {
  const res = await fetch(URL);
  const json = await res.json();
  const select = document.querySelector('#thunderstruck');
  
  json.forEach(item => {
    const option = document.createElement('option');
    option.value = item.username;
    option.innerText = item.company.catchPhrase;
    select.append(option);
  });
  
  return json;
}
