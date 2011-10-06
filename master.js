var SS = function () {
    document.addEventListener('keydown', _.bind(this.keydown, this), false);
    document.addEventListener('keypress', _.bind(this.keypress, this), false);
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

    this.navigateTo(0, 0);
};
SS.prototype = {
    keydown: function (event) {
        if (event.keyCode < 37 || event.keyCode > 40) {
            return;
        }

        event.preventDefault();
        switch (event.keyCode) {
        case 37:
        case 38:
            this.advance(-1);
            break;
        case 39:
        case 40:
            this.advance(1);
            break;
        }
    },

    keypress: function (event) {
        switch (event.keyCode) {
        case 101: // e: end
            this.navigateTo(this.sections.length - 1, 0);
            break;
        case 103: // g: goto
            break;
        case 104: // h: home
            this.navigateTo(0, 0);
            break;
        case 110: // n: next section
            // next section
            this.navigateTo(this.currentSection + 1, 0);
            break;
        case 112: // p: previous section
            this.navigateTo(this.currentSection - 1, 0);
            break;
        }
    },

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

    touchstart: function (event) {
        console.log('touchstart', event);
    },

    hashchange: function (event) {
        console.log('hashchange', event);
    }
};

document.addEventListener('DOMContentLoaded', function (event) {
    SS.instance = new SS();
}, false);
