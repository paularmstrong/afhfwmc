var SS = function () {
    document.addEventListener('keydown', _.bind(this.keydown, this), false);
    document.addEventListener('keypress', _.bind(this.keypress, this), false);
    document.addEventListener('keyup', _.bind(this.keyup, this), false);
    document.addEventListener('touchstart', _.bind(this.touchstart, this), false);
    document.addEventListener('hashchange', _.bind(this.hashchange, this), false);

    this.currentSection = 0;
    this.currentSlide = 0;

    this.sections = Array.prototype.slice.call(document.querySelectorAll('body > header,body > article,body > footer'));

    if (!this.sections.length) {
        throw 'No slides found';
    }

    this.articles = [];
    this.sections.map(_.bind(function (el) {
        this.articles.push(Array.prototype.slice.call(el.querySelectorAll('header, section, footer')));
    }, this));

    var form = document.createElement('form');
    form.setAttribute('method', 'get');
    form.setAttribute('id', 'goto');
    form.innerHTML = '<h1>Go To Slide</h1>' +
        '<ul>' +
            '<li>' +
                '<label for="section">Section</label>' +
                '<input type="number" min="1" max="' + this.sections.length + '" value="1" step="1" name="section" id="section">' +
            '</li>' +
            '<li>' +
                '<label for="slide">Slide</label>' +
                '<input type="number" min="1" value="1" step="1" name="slide" id="slide">' +
           ' </li>' +
        '</ul>' +
        '<button type="submit">Go</button>';
    document.body.appendChild(form);
    form.addEventListener('submit', _.bind(this.formSubmit, this), false);

    this.navigateTo(0, 0);
};
SS.prototype = {
    advance: function (count) {
        var section = this.currentSection,
            articles = this.articles[section],
            article = this.currentSlide + count;

        if ((section === 0 && article < 0) || (section === this.sections.length - 1 && article > articles.length - 1)) {
            return;
        }

        if (!articles.length || articles.length <= article) {
            section += 1;
            article = 0;
        } else if (article <= -1) {
            section -= 1;
            article = this.articles[section].length - 1;
        }

        this.navigateTo(section, article);
    },

    navigateTo: function (section, article) {
        var index;

        function setClasses(els, curIndex) {
            var index = Math.max(Math.min(curIndex, els.length - 1), 0);
            els[index].setAttribute('class', 'present');
            els.slice(0, index).map(function (el) {
                el.setAttribute('class', 'past');
            });
            els.slice(index + 1).map(function (el) {
                el.setAttribute('class', 'future');
            });
            return index;
        }

        index = setClasses(this.sections, section);
        this.currentSection = index;
        if (this.articles[index].length) {
            this.currentSlide = setClasses(this.articles[index], article);
        }
    },

    keydown: function (event) {
        switch (event.keyCode) {
        case 37:
        case 38:
            this.advance(-1);
            break;
        case 39:
        case 40:
            this.advance(1);
            break;
        default:
            return;
        }
        event.preventDefault();
    },

    keypress: function (event) {
        switch (event.keyCode) {
        case 101: // e: end
            this.navigateTo(this.sections.length - 1, 0);
            break;
        case 103: // g: goto
            this.showGotoForm();
            break;
        case 115: // s: start
            this.navigateTo(0, 0);
            break;
        case 110: // n: next section
            // next section
            this.navigateTo(this.currentSection + 1, 0);
            break;
        case 112: // p: previous section
            this.navigateTo(this.currentSection - 1, 0);
            break;
        default:
            return;
        }

        event.preventDefault();
    },

    keyup: function (event) {
        switch (event.keyCode) {
        case 27:
            this.hideGotoForm();
            break;
        default:
            return;
        }

        event.preventDefault();
    },

    showGotoForm: function () {
        var form = document.querySelector('#goto');

        form.setAttribute('class', 'show');
        form.querySelector('#section').value = this.currentSection + 1;
        form.querySelector('#section').focus();
        form.querySelector('#slide').value = this.currentSlide + 1;
    },

    hideGotoForm: function () {
        document.querySelector('#goto').setAttribute('class', '');
    },

    formSubmit: function (event) {
        event.preventDefault();

        var form = document.querySelector('#goto'),
            section = parseInt(form.querySelector('#section').value, 10) - 1,
            slide = parseInt(form.querySelector('#slide').value, 10) - 1;

        this.navigateTo(section, slide);

        this.hideGotoForm();
    },

    touchstart: function (event) {
        if (event.touches.length !== 1) {
            return;
        }

        event.preventDefault();

        var touch = event.touches[0],
            wt = window.innerWidth * 0.3,
            ht = window.innerHeight * 0.3;

        if (touch.clientX < wt) {
            this.navigateTo(this.currentSection - 1, 0);
        } else if (touch.clientX > window.innerWidth - wt) {
            this.navigateTo(this.currentSection + 1, 0);
        } else if (touch.clientY < ht) {
            this.navigateTo(this.currentSection, this.currentSlide - 1);
        } else if (touch.clientY > window.innerHeight - ht) {
            this.navigateTo(this.currentSection, this.currentSlide + 1);
        }
    },

    hashchange: function (event) {
        console.log('hashchange', event);
    }
};

document.addEventListener('DOMContentLoaded', function (event) {
    SS.instance = new SS();
}, false);
