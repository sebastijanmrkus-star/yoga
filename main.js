var DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var CLASSES = [
  { name: 'Morning Flow',   days: ['Mon','Tue','Wed','Thu','Fri'], time: '7:00',  by: 'Asha'  },
  { name: 'Power Vinyasa',  days: ['Tue','Thu'],                   time: '18:30', by: 'Rohan' },
  { name: 'Prenatal Yoga',  days: ['Wed','Sat'],                   time: '11:00', by: 'Meera' },
  { name: 'Yin Yoga',       days: ['Mon','Fri'],                   time: '19:30', by: 'Asha'  },
  { name: 'Sunset Hatha',   days: ['Mon','Wed','Fri','Sun'],       time: '17:30', by: 'Kabir' }
];
var COMING = [{ name: 'Yin Yoga', days: ['Sat'] }];
var TEACHERS = ['Asha','Rohan','Meera','Kabir'];

// Timetable cards
document.getElementById('classes').innerHTML = CLASSES.map(function (c) {
  var chips = DAYS.map(function (d) { return '<span class="' + (c.days.indexOf(d) > -1 ? 'on' : '') + '">' + d + '</span>'; }).join('');
  return '<article class="class"><div class="class-head"><h3>' + c.name + '</h3><div class="time">' + c.time + '</div></div>' +
         '<div class="with">with ' + c.by + '</div><div class="days" aria-label="' + c.days.join(', ') + '">' + chips + '</div></article>';
}).join('') + COMING.map(function (c) {
  var chips = DAYS.map(function (d) { return '<span class="' + (c.days.indexOf(d) > -1 ? 'soon' : '') + '">' + d + '</span>'; }).join('');
  return '<article class="class coming"><div class="class-head"><h3>' + c.name + '</h3><div class="badge">Coming soon</div></div>' +
         '<div class="with">Saturday class &middot; requested by our members</div><div class="days" aria-label="' + c.days.join(', ') + '">' + chips + '</div></article>';
}).join('');

// Instructor cards
document.getElementById('people').innerHTML = TEACHERS.map(function (t) {
  var list = CLASSES.filter(function (c) { return c.by === t; }).map(function (c) { return c.name; }).join(' · ');
  return '<div class="person"><div class="avatar" aria-hidden="true">' + t[0] + '</div><h3>' + t + '</h3><p>' + list + '</p></div>';
}).join('');

// Form wiring: day options follow the chosen class.
// The HTML lists all days so the form still works without JS; JS narrows them.
var form = document.getElementById('bookForm');
var classSel = document.getElementById('classSel'), daySel = document.getElementById('daySel');
function fillDays() {
  var c = CLASSES.filter(function (x) { return x.name === classSel.value; })[0];
  daySel.innerHTML = c
    ? '<option value="">Choose a day</option>' + c.days.map(function (d) { return '<option>' + d + '</option>'; }).join('')
    : '<option value="">Choose a class first</option>';
}
classSel.addEventListener('change', fillDays);
fillDays();
form.noValidate = true;

// Submit to Netlify Forms in the background, then show the thank-you state
form.addEventListener('submit', function (e) {
  e.preventDefault();
  var err = document.getElementById('err'), btn = form.querySelector('button[type=submit]');
  var name = form.elements.name.value.trim(), phone = form.elements.phone.value.trim();
  var cls = form.elements['class'].value, day = form.elements.day.value;
  if (!name || !/^[+\d][\d\s-]{6,}$/.test(phone) || !cls || !day) {
    err.textContent = 'Please fill in your name, a valid phone number, a class and a day.';
    return;
  }
  err.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Sending…';

  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(new FormData(form)).toString()
  }).then(function (res) {
    if (!res.ok) throw new Error(res.status);
    document.getElementById('tyName').textContent = name.split(' ')[0];
    document.getElementById('tyMsg').textContent = 'We have your request for ' + cls + ' on ' + day + '. We will call you on ' + phone + ' to confirm.';
    form.classList.add('done');
  }).catch(function () {
    err.textContent = "Couldn't send your booking. Please try again or call us.";
  }).then(function () {
    btn.disabled = false;
    btn.textContent = 'Book my spot';
  });
});
