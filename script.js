// Student Registration Form: front-end validation only. Nothing is sent anywhere.

var form = document.getElementById("reg-form");
var summary = document.getElementById("summary");
var summaryName = document.getElementById("s-name");
var summaryList = document.getElementById("s-list");

// each rule returns an error message, or "" if the value is fine
var rules = {
    fullname: function (v) {
        v = v.trim();
        if (v === "") { return "Please enter your full name."; }
        if (v.length < 3) { return "Name must be at least 3 letters."; }
        if (!/^[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F .'-]*$/.test(v)) { return "Use letters and spaces only."; }
        return "";
    },
    email: function (v) {
        v = v.trim();
        if (v === "") { return "Please enter your email address."; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { return "Enter a valid email, like you@example.com."; }
        return "";
    },
    phone: function (v) {
        v = v.trim();
        if (v === "") { return "Please enter your mobile number."; }
        if (!/^[6-9][0-9]{9}$/.test(v)) { return "Enter a valid 10-digit Indian mobile number."; }
        return "";
    },
    dob: function (v) {
        if (v === "") { return "Please choose your date of birth."; }
        var born = new Date(v), today = new Date();
        if (isNaN(born.getTime()) || born > today) { return "Date of birth cannot be in the future."; }
        var age = today.getFullYear() - born.getFullYear();
        var m = today.getMonth() - born.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < born.getDate())) { age--; }
        if (age < 15) { return "You must be at least 15 years old."; }
        if (age > 80) { return "Please check the date of birth."; }
        return "";
    },
    course: function (v) {
        return v === "" ? "Please select a course." : "";
    },
    percent: function (v) {
        if (v === "") { return ""; }          // optional field
        var n = parseFloat(v);
        if (isNaN(n) || n < 0 || n > 100) { return "Enter a percentage between 0 and 100."; }
        return "";
    },
    address: function (v) {
        v = v.trim();
        if (v === "") { return "Please enter your address."; }
        if (v.length < 10) { return "Please write a fuller address (at least 10 characters)."; }
        return "";
    }
};

function showError(name, message) {
    var field = form.querySelector('[data-field="' + name + '"]');
    var box = document.getElementById(name + "-error");
    var input = form.elements[name];
    box.textContent = message;
    field.classList.toggle("invalid", message !== "");
    var hasValue = input && input.value !== undefined && input.value !== "";
    field.classList.toggle("valid", message === "" && hasValue && name !== "percent");
    if (input && input.setAttribute && !input.length) {
        input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
    }
}

function check(name) {
    var message = rules[name](form.elements[name].value);
    showError(name, message);
    return message === "";
}

function checkGender() {
    var picked = form.elements.gender.value;
    showError("gender", picked === "" ? "Please select your gender." : "");
    return picked !== "";
}

function checkTerms() {
    var ok = form.elements.terms.checked;
    showError("terms", ok ? "" : "Please confirm that the details are correct.");
    return ok;
}

// phone: allow digits only while typing
form.elements.phone.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
});

// check on leaving a field, then fix live while typing
Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener("blur", function () { check(name); });
    input.addEventListener("input", function () {
        if (document.getElementById(name + "-error").textContent !== "") { check(name); }
    });
    input.addEventListener("change", function () { check(name); });
});
Array.prototype.forEach.call(form.elements.gender, function (r) { r.addEventListener("change", checkGender); });
form.elements.terms.addEventListener("change", checkTerms);

// submit
form.addEventListener("submit", function (event) {
    event.preventDefault();

    var results = Object.keys(rules).map(check);
    var okGender = checkGender();
    var okTerms = checkTerms();

    var firstBad = form.querySelector(".invalid");
    if (firstBad) {
        var target = firstBad.querySelector("input, select, textarea");
        if (target) { target.focus(); }
        return;
    }

    showSummary();
});

function addRow(label, value) {
    var row = document.createElement("div");
    var dt = document.createElement("dt");
    var dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value === "" ? "Not given" : value;
    row.appendChild(dt);
    row.appendChild(dd);
    summaryList.appendChild(row);
}

function showSummary() {
    var e = form.elements;
    summaryList.innerHTML = "";
    summaryName.textContent = e.fullname.value.trim();
    addRow("Full name", e.fullname.value.trim());
    addRow("Email", e.email.value.trim());
    addRow("Mobile", "+91 " + e.phone.value.trim());
    addRow("Date of birth", new Date(e.dob.value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
    addRow("Gender", e.gender.value);
    addRow("Course", e.course.value);
    addRow("Last exam %", e.percent.value === "" ? "" : e.percent.value + "%");
    addRow("Address", e.address.value.trim());

    form.hidden = true;
    document.querySelector(".sub").hidden = true;
    summary.hidden = false;
    summary.focus();
}

// reset: clear errors too
form.addEventListener("reset", function () {
    setTimeout(function () {
        form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid", "valid"); });
        form.querySelectorAll(".error").forEach(function (p) { p.textContent = ""; });
    }, 0);
});

document.getElementById("again").addEventListener("click", function () {
    form.reset();
    summary.hidden = true;
    form.hidden = false;
    document.querySelector(".sub").hidden = false;
    form.elements.fullname.focus();
});
