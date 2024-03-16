const HANCOMUI = {};

(function (window) {
    'use strict';

    const userAgent = navigator.userAgent;
    const isMobile = (/(ip(ad|hone|od)|android)/i).test(userAgent) || (navigator.platform.toLowerCase() === 'macintel' && navigator.maxTouchPoints > 1);
    const isApple = (/ip(ad|hone|od)/i).test(userAgent);
    const isAndroid = (/android/i).test(userAgent);
    const isEdge = (/(edge|edg)/i).test(userAgent);
    const isFirefox = (/firefox/i).test(userAgent);
    const isSafari = (/safari/i).test(userAgent) && !(/chrome/i).test(userAgent);
    const isMacintosh = (/macintosh/i).test(userAgent);
    let language = document.documentElement.getAttribute('lang');
    const isTouchSupported = !!(
        'ontouchstart' in window || // iOS & 안드로이드
        (navigator.pointerEanbled && navigator.maxTouchPoints > 0)
    );  // IE 11+
    const _languageMsg = {
        default: { // English
            confirm: "Confirm",
            cancel: "Cancel",
            close: "Close"
        },
        de: { // Deutsch
            confirm: "Confirm",
            cancel: "Cancel",
            close: "Close"
        },
        es: { // Español
            confirm: "Confirm",
            cancel: "Cancel",
            close: "Close"
        },
        ja: { // 日本語
            confirm: "Confirm",
            cancel: "Cancel",
            close: "Close"
        }
    }; // [alert, confirm Layer Popup] button label
    const languageMsg = Object.keys(_languageMsg).includes(language) ? Object.assign({}, _languageMsg[language]) : Object.assign({}, _languageMsg.default);

    isEdge && document.documentElement.classList.add('edge');
    isSafari && document.documentElement.classList.add('safari');
    isFirefox && document.documentElement.classList.add('firefox');
    isMacintosh && document.documentElement.classList.add('macintosh');
    isTouchSupported && document.documentElement.classList.add('touch');
    isMobile && document.documentElement.classList.add('mobile');

    const $html = document.documentElement;
    const $body = document.body;
    const $header = document.querySelector('.header');
    const $footer = document.querySelector('.footer');
    const $container = document.querySelector('.container');
    let areaWidth = window.innerWidth, areaHeight = window.innerHeight;

    const ui = {
        query: {},
        dataJsonParse: (data) => {
            return data.match("{") ? JSON.parse(data.replace(/'/g, '"')) : {};
        },
        nodeToArray: (el) => {
            if (!el.length) return [];
            else if (el.length == 1) return [el];
            else return Array.from(el);
        },
        forEachDOM: (el, callback) => {
            if (callback) Array.prototype.forEach.call(el, callback);
        },
        smoothScroll: {
            lenis: null,
            loop: function (time) {
                // this.lenis.raf(time);
                // requestAnimationFrame(this.loop.bind(this));
            },
            init: function () {
                // this.lenis = new Lenis();
                // requestAnimationFrame(this.loop.bind(this));
                // 페이지별 스크롤
                // this.lenis.on('scroll', (e) => {
                // 	ui.layout.pageEventScroll.forEach(func => {
                // 		func && func();
                // 	});
                // })
            }
        },
        splitLetters: ($node, split) => {
            const tag = "span";
            $node.innerHTML = $node.innerText.split(' ').map((letter) => `<${tag}><${tag} class="in">${letter}</${tag}></${tag}>`).join("");
            return [].slice.call($node.children);
        },
        getScrollData: (item, type) => {
            // {'start': '80%', 'end': 'top', 'activeclass': 'ani', 'related': null, 'relatedclass': 'ani', 'markers': false}
            const _option = ui.dataJsonParse(item.dataset[type]);
            if (!_option.activeclass) {
                _option.activeclass = "ani";
            }
            if (!_option.start) {
                _option.start = "80%";
            }
            if (!_option.end) {
                _option.end = "top";
            }
            if (_option.related && !_option.relatedclass) {
                _option.relatedclass = _option.activeclass;
            }

            const _return = {
                start: 'top ' + _option.start,
                end: 'bottom ' + _option.end,
                trigger: item,
                markers: _option.markers || false,
                scrub: 1,
                onUpdate: self => {
                    type == "scrollper" && item.style.setProperty("--per", self.progress);
                    if (self.progress <= 0) {
                        item.classList.remove(_option.activeclass);
                        _option.related && document.querySelector(_option.related) && document.querySelector(_option.related).classList.remove(_option.relatedclass);
                    } else if (!item.classList.contains(_option.activeclass)) {
                        item.classList.add(_option.activeclass);
                        _option.related && document.querySelector(_option.related) && document.querySelector(_option.related).classList.add(_option.relatedclass);
                    }
                }
            }
            return _return;
        },
        setScrollTrigger: (type) => {
            if (!type) return true;

            ui.forEachDOM(document.querySelectorAll(`[data-${type}]`), (item) => {
                if (type == "scrollplay") {
                    item._option = ui.dataJsonParse(item.dataset[type]);
                    item._option.start = 'bottom';
                    item._option.end = 'top';
                    if (!item._option.visible) {
                        item._option.visible = 1;
                    }
                    if (isMobile) {
                        item.muted = false;
                        item.removeAttribute("playsinline");
                        item.removeAttribute("loop");
                        isMobile && item.setAttribute("controls", true);
                    }
                    ui.layout.pageEventScroll.push(() => {
                        const _rect = item.getBoundingClientRect();
                        const _visible_ratio = (_rect.top > 0 ? Math.min(_rect.bottom, areaHeight) - _rect.top : _rect.height + _rect.top) / _rect.height;
                        if (_visible_ratio >= item._option.visible) {
                            !(isMobile && isApple) && item.paused && item.play();
                        } else if (!item.paused) {
                            !(isMobile && isApple) && item.pause();
                            !item.loop && (item.currentTime = 0);
                        }
                        console.log(_visible_ratio)
                    });
                } else {
                    // gsap.to(item, {
                    //     trigger: item,
                    //     scrollTrigger: ui.getScrollData(item, type)
                    // });
                }
            });
            // type != "scrollplay" && setTimeout(ScrollTrigger.refresh.bind(this), 500);
        },
        setAniDelay: function () {
            document.querySelectorAll("[data-scrolltoggle]").forEach((el) => {
                el.querySelectorAll("[data-ani]:not([data-ani=splitText]), [data-ani='splitText'] > *").forEach((aniel, idx) => {
                    aniel.style.setProperty("--delay", idx);
                });
            });
        },
        setAniAccordion: function (wrap, head) {
            if (!wrap) {
                wrap = "[data-scrollaccordion]";
            }
            if (!head) {
                head = "dt";
            }
            const elements = document.querySelectorAll(wrap + " " + head);
            if (!elements || !elements.length) {
                return false;
            }

            document.querySelectorAll((wrap)).forEach((el) => {
                el.onclick = (e) => {
                    const _target = e.target;
                    let _top, _min_top, _offset_top, _head = _target.closest(head);
                    if (_head) {
                        _min_top = parseInt(window.getComputedStyle(document.querySelector(".container")).getPropertyValue("padding-top")) + 5;
                        _top = Math.max(parseInt(window.getComputedStyle(_head).getPropertyValue("top")), _min_top);
                        _offset_top = _head.nextElementSibling.getBoundingClientRect().top;
                        window.scrollBy({left: 0, top: (_offset_top - _top - 1), behavior: "smooth"});
                        e.preventDefault();
                    }
                };
            });
            this.pageEventScroll.push(() => {
                elements.forEach((el) => {
                    let _cont = el.nextElementSibling, _cont_per;
                    if (_cont) {
                        const _el_rect = el.getBoundingClientRect(),
                            _el_top = parseInt(window.getComputedStyle(el).getPropertyValue("top"));
                        if (_el_top >= _el_rect.top && !el.classList.contains("sticky")) {
                            el.classList.add("sticky");
                        } else if (_el_top < _el_rect.top && el.classList.contains("sticky")) {
                            el.classList.remove("sticky");
                        }
                    }
                });
            });
        },
        setDropdown: function (type) {
            // {'case': null, 'trigger': 'button.dropdown-handle', 'target': '.dropdown-target', 'close': 'button.dropdown-close'}
            if (!type) {
                return true;
            }

            const _bodyclick = function (e) {
                if (!(e.target.dataset[type] || e.target.closest(`[data-${type}]`))) {
                    if (document.querySelector(`[data-${type}].active`)) {
                        document.querySelector(`[data-${type}].active`).triggerEl.click();
                    }
                }
            };

            ui.forEachDOM(document.querySelectorAll(`[data-${type}]`), (item) => {
                if (item.triggerEl) {
                    return;
                }
                const _option = ui.dataJsonParse(item.dataset[type]);
                const _click = function (e) {
                    if (item.triggerEl == e.target || item.closeEl == e.target) {
                        let _scroll_disable_el = (_option.case == "menu" || _option.case == "contactus");
                        if (item.classList.contains("active") || item.closeEl == e.target) {
                            item.classList.remove("active");
                            _option.case == "menu" && $header && $header.classList.remove("within-menu");
                            document.removeEventListener('click', _bodyclick);
                            if (_scroll_disable_el) {
                                const lastscroll = Math.max(document.documentElement.scrollTop, document.body.scrollTop); // 스크롤 위치 유지
                                ui.layout.scroll.enabled(lastscroll);
                                item.targetEl.scrollTop = 0;
                            }
                            if (_option.case == "menu") {
                                let _opend = item.querySelector(".opend");
                                _opend && _opend.classList.remove("opend");
                            }
                        } else {
                            item.classList.add("active");
                            _option.case == "menu" && $header && $header.classList.add("within-menu");
                            setTimeout(() => {
                                document.addEventListener('click', _bodyclick);
                            }, 30);
                            if (_scroll_disable_el) {
                                const lastscroll = Math.max(document.documentElement.scrollTop, document.body.scrollTop); // 스크롤 위치 유지
                                ui.layout.scroll.disabled(lastscroll);
                            }
                            if (_option.case == "menu") {
                                item.targetEl.scrollTop = 0;
                                ui.layout.header.el.contact && ui.layout.header.el.contact.classList.remove("active");
                            }
                        }
                        e.preventDefault && e.preventDefault();
                    }
                    if (_option.case && _option.case == "menu" && e.target.className == "sub-toggle") {
                        const _el_cur = e.target.closest('li');
                        const _el_child = _el_cur.parentNode.children;
                        e.target.nextElementSibling.style.setProperty("--scroll-height", e.target.nextElementSibling.scrollHeight + "px");
                        _el_cur.classList.toggle("opend");
                        ui.forEachDOM(_el_child, (el) => {
                            el != _el_cur && el.classList.remove("opend");
                        });
                    } else if (_option.case === 'lang') {
                        const lang = e.target.lang;
                        if (lang.length > 0) {
                            const handle = document.querySelector('.lang .dropdown-handle');
                            handle.innerText = lang.toUpperCase();
                            item.classList.remove("active");
                        }
                    }
                };
                if (!_option.close) {
                    _option.close = "button.dropdown-close";
                }
                if (!_option.trigger) {
                    _option.trigger = "button.dropdown-handle";
                }
                if (!_option.target) {
                    _option.target = ".dropdown-target";
                }
                item.triggerEl = item.querySelector(_option.trigger);
                item.targetEl = item.querySelector(_option.target);
                item.closeEl = item.querySelector(_option.close) || null;
                item.removeEventListener('click', _click);
                item.addEventListener('click', _click);
                item.targetEl.setAttribute("tabindex", 0);
                item.open = _click.bind(item, {target: item.triggerEl});
                item.close = _click.bind(item, {target: item.closeEl});
            });
        },
        setIndicator: function (type) {
            // {target: selector} [data-cur] [data-total] [data-name]
            if (!type) {
                return true;
            }

            const area = document.querySelector(`[data-${type}]`);
            if (!area) {
                return true;
            }
            const _option = ui.dataJsonParse(area.dataset[type]);
            if (!_option.target) {
                return;
            }
            const _items = document.querySelectorAll(_option.target);
            const _el_cur = area.querySelector("[data-cur]");
            const _el_total = area.querySelector("[data-total]");
            const _el_name = area.querySelector("[data-name]");
            _el_total && _items.length && _el_total.setAttribute("data-total", String(_items.length).padStart(2, "0"));
            _el_cur && this.layout.pageEventScroll.push(() => {
                let _curidx = -1, _curname = "";
                _items.length && _items.forEach((el, idx) => {
                    const _el_rect = el.getBoundingClientRect();
                    const _el_pos = {top: _el_rect.top, bottom: _el_rect.bottom, trigger: areaHeight * 0.5};
                    if (_el_pos.trigger >= _el_pos.top && _el_pos.trigger <= _el_pos.bottom) {
                        _curidx = idx;
                        _curname = el.dataset.indicatorName ? el.dataset.indicatorName : "";
                    }
                });
                if (_curidx != -1 && _el_cur) {
                    _el_cur.setAttribute("data-cur", String(_curidx + 1).padStart(2, "0"));
                    if (_el_name) {
                        _el_name.innerHTML = _curname;
                    }
                    area.style.visibility = "visible";
                }
            });
        },
        setTab: function (type) {
            // {'case': null, 'target': '.item', 'swipecont': null}
            if (!type) {
                return true;
            }

            const _class = {cur: "active", old: "old-active"};
            const classRemove = function (_name) {
                this.classList.remove(_name);
            };
            const _page_scroll_top = function (_option, item) { // [탭전환시] 내용 상단이 보이게 scrollTop 조절
                setTimeout(() => {
                    const _rect_top = item.nextElementSibling.getBoundingClientRect().top;
                    let _gap = 110, _top = _rect_top - item.offsetHeight, _sc = document.scrollingElement.scrollTop;
                    if (_rect_top < _gap || _rect_top > areaHeight * 0.6) {
                        window.scroll({top: (_sc + _top) - _gap, left: 0, behavior: "smooth"});
                    }
                }, 500);
            };
            const _cont_height = function () {// [탭내용] 높이 조절
                if (this.relation_el.classList.contains(_class.cur)) {
                    this.relation_el.parentNode.style.height = this.relation_el.offsetHeight + "px";
                }
            };
            const _tab_scroll_mov = function (_option, item) { // [탭] 화면에 다 안보일 경우 scrollLeft 조절
                const _rect = this.getBoundingClientRect();
                item && (_rect.left < 0 || _rect.right > areaWidth) && item.scroll({
                    left: this.offsetLeft - this.parentNode.offsetLeft,
                    behavior: "smooth"
                });
                isMobile && _cont_height.call(this);
            }
            const _click = function (_option, item, isSmooth, isFirst, e) {
                if (
                    !(_option.case == "class" && this.relation_el.classList.contains(_class.cur)) ||
                    !(_option.case != "class" && window.getComputedStyle(this.relation_el).getPropertyValue("display") == "block")
                ) {
                    if (_option.case == "class") {
                        this.relation_el.classList.add(_class.cur);
                    } else {
                        this.relation_el.style.display = "block";
                    }
                    if (_option.swipecont) {
                        _tabcont_scroll_mov.call(this.relation_el, _option, isSmooth);
                        !isFirst && _page_scroll_top.call(this, _option, item);
                    }
                }
                if (!this.classList.contains(_class.cur)) {
                    ui.forEachDOM(this.parentNode.querySelectorAll("." + _class.cur), (el) => {
                        el.classList.remove(_class.cur);
                        if (_option.case == "class") {
                            el.relation_el.classList.add(_class.old);
                            el.relation_el.classList.remove(_class.cur);
                            setTimeout(classRemove.bind(el.relation_el, _class.old), 1000);
                        } else {
                            el.relation_el.style.display = "none";
                        }
                    });
                    this.classList.add(_class.cur);
                    _tab_scroll_mov.call(this, _option, item);
                }
                isMobile && setTimeout(() => {
                    _cont_height.call(this);
                }, 500);
                e && e.preventDefault();
            };
            const _tabcont_scroll_mov = function (_option, isSmooth) { // [탭내용] 탭 클릭시, 내용 scrollLeft 조절
                if (!_option.swipecont || _option.swipecont.offsetWidth == _option.swipecont.scrollWidth) {
                    return false;
                }
                let _pos = this.offsetLeft - _option.swipecont.children[0].offsetLeft;
                _pos != _option.swipecont.scrollLeft && _option.swipecont.scroll({
                    left: _pos,
                    behavior: isSmooth ? "smooth" : "auto"
                }); // @cream : 2024-03-07 수정
            }
            const _touch_ignore = function (e) { // [내용 swipe] 터치 이벤트 제외 영역
                let _target = e.target;
                return (_target.nodeName.match(/(^A)|(INPUT)|(BUTTON)|(TEXTAREA)|(SELECT)/) || _target.closest("[data-swiper]")) || false;
            }
            const _touch_event = function (_option, e) {
                const isIgnore = _touch_ignore(e);
                if (e.type == "touchstart") {
                    _option.swipecont.touchPos = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                        direction: null,
                        start: _option.swipecont.scrollLeft,
                        curel: null
                    };
                    (this.querySelectorAll(_option.target)).forEach((el, idx) => {
                        if (el.classList.contains(_class.cur)) {
                            _option.swipecont.touchPos.curel = el;
                        }
                    });
                } else if (e.type == "touchmove") {
                    if (!_option.swipecont.touchPos.direction) {
                        _option.swipecont.touchPos.direction = (Math.abs(_option.swipecont.touchPos.x - e.touches[0].clientX) > Math.abs(_option.swipecont.touchPos.y - e.touches[0].clientY)) ? "x" : "y";
                    }
                    if (_option.swipecont.touchPos.direction == "y" || isIgnore) {
                        return true;
                    }

                    _option.swipecont.scrollLeft = _option.swipecont.touchPos.start + (_option.swipecont.touchPos.x - e.touches[0].clientX);
                    e.preventDefault();
                } else if (e.type == "touchend" || e.type == "touchcancel") {
                    if (_option.swipecont.touchPos.direction == "y" || isIgnore) {
                        return true;
                    }
                    const _distance = _option.swipecont.touchPos.start - _option.swipecont.scrollLeft;
                    let _endel;
                    if (Math.abs(_distance) < 70) {
                        _option.swipecont.scroll({left: _option.swipecont.touchPos.start, behavior: "smooth"});
                    } else {
                        if (_distance < 0) {
                            _endel = _option.swipecont.touchPos.curel.nextElementSibling;
                        } else if (_distance > 0) {
                            _endel = _option.swipecont.touchPos.curel.previousElementSibling;
                        }
                        if (_endel) {
                            _click.call(_endel, _option, this, true, false);
                        }
                    }
                    e.preventDefault();
                }
            };
            ui.forEachDOM(document.querySelectorAll(`[data-${type}]`), (item) => {
                const _option = ui.dataJsonParse(item.dataset[type]);
                if (!_option.target) {
                    _option.target = ".item";
                }
                if (!_option.case) {
                    _option.case = null;
                }
                if (!_option.swipecont) {
                    _option.swipecont = null;
                } else {
                    _option.swipecont = document.querySelector(_option.swipecont);
                }
                if (_option.swipecont) {
                    _option.swipecont.classList.add("tab-cont-swipe");
                    isTouchSupported && _option.swipecont.addEventListener("touchstart", _touch_event.bind(item, _option));
                    isTouchSupported && _option.swipecont.addEventListener("touchmove", _touch_event.bind(item, _option));
                    isTouchSupported && _option.swipecont.addEventListener("touchend", _touch_event.bind(item, _option));
                    isTouchSupported && _option.swipecont.addEventListener("touchcancel", _touch_event.bind(item, _option));
                }
                ui.forEachDOM(item.querySelectorAll(_option.target), (el) => {
                    const _tab_el = !el.nodeName.match(/(^a$)|(button)/i) ? el.querySelector("a, button") : el;
                    const _id = (_tab_el.getAttribute("href") || _tab_el.getAttribute("data-href")).replace(/^[\.\#]/, "");
                    if (el.relation_el) {
                        return;
                    }
                    el.relation_el = document.getElementById(_id);
                    window.ResizeObserver && isMobile && new ResizeObserver(_cont_height.bind(el)).observe(el.relation_el);
                    if (el.relation_el) {
                        el.relation_el.relation_el = el;
                        _tab_el.addEventListener("click", _click.bind(el, _option, item, false, false));
                        if ((ui.query.sec && ui.query.sec == _id) || !ui.query.sec && el.classList.contains(_class.cur)) {
                            _click.call(el, _option, item, false, true, false);
                        } else if (el.classList.contains(_class.cur)) {
                            el.relation_el.classList.add(_class.cur);
                        }
                    }
                });
            });
        },
        setSwiper: function (type) {
            const _default = {
                loop: true,
                pagination: {el: '.swiper-pagination'},
                navigation: {nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev'},
                scrollbar: {el: '.swiper-scrollbar'},

            };
            ui.forEachDOM(document.querySelectorAll(`[data-${type}]`), (el) => {
                const _swiper = el.dataset.swiper;
                const _el = el.classList.contains(_swiper.replace(/^(\.\#)/, "")) ? el : el.querySelector(_swiper);
                const _option = {
                    loop: _default.loop,
                    autoplay: {
                        delay: 5000,
                    },
                    pagination: {
                        el: el.querySelector(_default.pagination.el) ? _default.pagination.el : null,
                        clickable: true,
                        renderBullet: function (index, className) {
                            return '<button type="button" class="' + className + '">' + (index + 1) + '</button>'
                        }
                    },
                    navigation: {
                        nextEl: el.querySelector(_default.navigation.nextEl) ? _default.navigation.nextEl : null,
                        prevEl: el.querySelector(_default.navigation.prevEl) ? _default.navigation.prevEl : null
                    },
                    scrollbar: {el: el.querySelector(_default.scrollbar.el) ? _default.scrollbar.el : null},
                    on: {
                        slideChange: function (el) {
                            el.hostEl.setAttribute("activeIndex", "activeIndex" + el.realIndex);
                        },
                    },
                };
                el.swiper = new Swiper(_el, _option);
            });
        },
        setValidCheck: function (type) {
            const regexp = {
                email: new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])"),
                name: new RegExp(/[0-9`~!@#$%^&*()_|+\-=?;:'\",.<>\{\}\[\]\\\/]/, "gim")
            };
            ui.forEachDOM(document.querySelectorAll(`[data-${type}]`), (el) => {
                const _option = ui.dataJsonParse(el.dataset[type]);
                if (_option.type != "required") {
                    return;
                }

                if (!_option.send) {
                    _option.send = ".btn-send";
                }
                const requiredCheck = (e) => {
                    var _state;
                    ui.forEachDOM(el.querySelectorAll("[required]"), (ipt) => {
                        let _pattern = ipt.dataset.pattern;
                        ipt.value = ipt.value.trimStart();
                        if (_pattern) {
                            if (_pattern == "name") {
                                ipt.value = ipt.value.replace(regexp.name, "");
                            } else if (_pattern == "email" && !((regexp.email).test(ipt.value))) {
                                _state = true;
                            }
                        }
                        let isBlank = !ipt.type.match(/(checkbox|radio|select)/) && (!ipt.value || ipt.value == "");
                        let isSelectBlank = (ipt.nodeName.match(/select/i) && ipt.value == "placeholder");
                        if (ipt.id === 'interest') {
                            isBlank = false;
                            isSelectBlank = false;
                        }
                        let isCheckBlank = (ipt.type.match(/(checkbox|radio)/) && !ipt.checked);
                        if (isBlank || isSelectBlank || isCheckBlank) {
                            _state = true;
                        }
                    });
                    el.querySelector(_option.send).disabled = _state;
                };
                el.removeEventListener('input', requiredCheck);
                el.addEventListener('input', requiredCheck);
                requiredCheck();
            });
        },
        setVideoEvent: function (mov) {
            mov.forEach((el) => {
                el.onplaying = function () {
                    this.classList.add("playing");
                }
                el.onpause = function () {
                    this.classList.remove("playing");
                }
                el.onvolumechange = function () {
                    if (!this.muted) this.classList.add("unmuted");
                    else this.classList.remove("unmuted");
                }
                if (!el.muted) {
                    el.classList.add("unmuted");
                }
            });
        },
        system: {
            create: function (type, option) {
                if (!option.msg) {
                    return false;
                }
                const msg = option.msg;
                const stayStillWhenClicked = option.stayStillWhenClicked;
                const _btn = option.btn || {};
                const _target = option.target ? document.querySelector(option.target) : document.body;
                const btn = {
                    cancel: _btn.cancel || languageMsg.cancel,
                    confirm: _btn.confirm || languageMsg.confirm
                };
                const callback = option.callback;
                const _buttonId = option.buttonId;
                const _id = "systemModal" + (new Date()).getTime() + "r" + Math.floor(Math.random() * 100000);
                const temp = `<div id="${_id}" class="modal system ${type == "toast" ? "toast" : "dim"}">
					<div class="inner">
						<div class="msg">${msg}</div>
						${type == "toast" ? "" : `<div class="modal-btn">
							${type == "confirm" ? `<button type="button" class="btn type-2" data-return="0">${btn.cancel}</button>` : ""}
							<button type="button" class="btn type" data-return="${type == "confirm" ? 1 : 0}" ${_buttonId ? `id="${_buttonId}"` : ''}>${btn.confirm}</button>
						</div>`}
					</div>
				</div>`;
                _target.insertAdjacentHTML('beforeend', temp);
                if (!type == "toast") {
                    const lastscroll = Math.max(document.documentElement.scrollTop, document.body.scrollTop); // 스크롤 위치 유지
                    ui.layout.scroll.disabled(lastscroll);
                }
                const _func = function (state, e) {
                    document.querySelector("#" + _id).remove();
                    !type == "toast" && ui.layout.scroll.enabled(lastscroll);
                    callback && callback.call(this, state);
                };
                if (type == "toast") {
                    setTimeout(_func.bind(this, true), 3000);
                } else {
                    document.querySelector("#" + _id + ' [data-return="0"]').addEventListener('click', _func.bind(this, false));
                    if (type == "confirm") {
                        document.querySelector("#" + _id + ' [data-return="1"]').addEventListener('click', _func.bind(this, true));
                    }
                }
            },
            alert: function (option) {
                ui.system.create.call(this, "alert", option);
            },
            confirm: function (option) {
                ui.system.create.call(this, "confirm", option);
            },
            toast: function (option) {
                ui.system.create.call(this, "toast", option);
            }
        },
        layer: {
            timer: null,
            lastscroll: 0,
            getElement: function (selector) {
                let _el;
                if (selector.nodeName) {
                    _el = selector;
                } else if (typeof selector == "string") {
                    _el = document.querySelector(selector);
                } else if (!selector.nodeName && typeof selector == "object" && selector.length) {
                    _el = selector[0];
                }

                return _el.nodeName ? _el : false;
            },
            getZindex: function (els) {
                let _zindex = 200, _target, _z;
                els.forEach((_el) => {
                    if (_el.length) {
                        _target = _el[0];
                    } else _target = _el;
                    _z = window.getComputedStyle(_target).getPropertyValue("z-index");
                    if (_zindex < _z) {
                        _zindex = _z;
                    }
                });
                return _zindex + 1;
            },
            hide: function (option) {
                if (!option || !option.node) {
                    return false;
                }
                option.dim && ui.layout.scroll.enabled(ui.layer.lastscroll);

                let _el = ui.layer.getElement(option.node);
                if (!_el) {
                    return false;
                }
                _el.removeAttribute("data-modal-wrap");
                _el.classList.remove("visible");
                option.dim && _el.classList.remove("dim");
                clearTimeout(ui.layer.timer);
                ui.layer.timer = setTimeout(() => {
                    _el.setAttribute("hidden", true);
                    option.callback && option.callback.hide && option.callback.hide.call(_el);
                }, 250);
            },
            show: function (option) {
                if (!option || !option.node) {
                    return false;
                }
                let _el = ui.layer.getElement(option.node);
                if (!_el) {
                    return false;
                }
                _el.style.zIndex = ui.layer.getZindex(ui.nodeToArray(document.querySelectorAll("[data-modal-wrap]")));
                _el.removeAttribute("hidden");
                _el.setAttribute("data-modal-wrap", true);
                _el.setAttribute("data-lenis-prevent-wheel", true);
                option.callback && option.callback.show && option.callback.show.call(_el);
                clearTimeout(ui.layer.timer);
                ui.layer.timer = setTimeout(() => {
                    _el.classList.add("visible");
                }, 100);
                ui.layer.lastscroll = Math.max(document.documentElement.scrollTop, document.body.scrollTop); // 스크롤 위치 유지
                if (option.dim) {
                    _el.classList.add("dim");
                    ui.layout.scroll.disabled(ui.layer.lastscroll);
                }
                const _close_func = ui.layer.hide.bind(this, option);
                ui.forEachDOM(_el.querySelectorAll(`[data-modal-control="close"]`), (_close) => {
                    _close.removeEventListener('click', _close_func);
                    _close.addEventListener('click', _close_func);
                });
            },
            createMovie: function (option) {
                const _id = "systemModal" + (new Date()).getTime() + "r" + Math.floor(Math.random() * 100000);
                const temp = `<div id="${_id}" class="modal video">
					<div class="inner">
						<div class="mov">
							<video autoplay muted controls playsinline>
								<source type="video/${option.url.match(/[^\.][a-z0-9]*$/g)[0]}" src="${option.url}" />
							</video>
						</div>
						<button type="button" class="modal-close" data-modal-control="close"><span class="blind">${languageMsg.close}</span></button>
					</div>
				</div>`;
                document.body.insertAdjacentHTML('beforeend', temp);
                option.node = "#" + _id;
                option.dim = true;
                option.callback = {
                    hide: function () {
                        this.remove();
                    }
                };
                this.show(option);
            },
        },
        layout: {
            scroll: {
                disabled: function (lastscroll) {
                    $html.classList.add("scroll-disabled");
                    document.scrollingElement.scrollTop = lastscroll;
                },
                enabled: function (lastscroll) {
                    $html.classList.remove("scroll-disabled");
                    document.scrollingElement.scrollTop = lastscroll;
                }
            },
            commonBg: {
                el: null,
                init: function () {
                    this.el = document.querySelector(".page-bg-mov video");
                    if (!this.el) {
                        return false;
                    }
                    this.el.addEventListener("play", (e) => {
                        this.el.classList.add("load");
                    });
                }
            },
            header: {
                el: {contact: null},
                menu: {
                    in: function (e) {
                        $header.classList.add("within-menu"); // gnb 열렸을 때
                    },
                    out: function (e) {
                        $header.classList.remove("within-menu"); // gnb 닫혔을 때
                    }
                },
                init: function () {
                    $header.querySelector(".menu").removeEventListener('mouseenter', this.menu.in);
                    $header.querySelector(".menu").removeEventListener('focusin', this.menu.in);
                    $header.removeEventListener('mouseleave', this.menu.out);
                    $header.querySelector(".menu").removeEventListener('focusout', this.menu.out);
                    window.removeEventListener('resize', this.menu.out);

                    $header.querySelector(".menu").addEventListener('mouseenter', this.menu.in);
                    $header.querySelector(".menu").addEventListener('focusin', this.menu.in);
                    $header.addEventListener('mouseleave', this.menu.out);
                    $header.querySelector(".menu").addEventListener('focusout', this.menu.out);
                    window.addEventListener('resize', this.menu.out);

                    this.el.contact = document.querySelector(".contact-us");
                }
            },
            pageEventScroll: [], // 공통 window.onscroll 이벤트 외 영역/페이지 별로 실행되어야 할 함수 추가.
            pageEventResize: [], // 공통 window.onresize 이벤트 외 영역/페이지 별로 실행되어야 할 함수 추가.
            eventScroll: function () {
                $header && (() => {
                    const scrollY = document.scrollingElement.scrollTop;
                    const scrollH = document.scrollingElement.scrollHeight;
                    $header.style.setProperty("--page-per", (scrollY / (scrollH - areaHeight) * 100) + "%");
                    if ($header.oldScrollY && $header.oldScrollY == scrollY) {
                        return false;
                    }
                    const minPos = scrollY > 70;
                    if (minPos) {
                        $header.classList.add("min");
                    } else $header.classList.remove("min");

                    if ($header.oldScrollY == undefined) {
                        $header.oldScrollY = scrollY;
                        $header.classList.add("scroll");
                    }
                    if (Math.abs($header.oldScrollY - scrollY) < 5) {
                        return false;
                    }

                    let curScrollDir = ($header.oldScrollY > scrollY) ? "scroll-up" : "scroll-down";
                    if ($html?.scrollDir != curScrollDir) {
                        $header.className = $header.className.replace(/scroll(-|[^ ])*/, curScrollDir);
                    }
                    $html.scrollDir = curScrollDir;
                    $header.oldScrollY = scrollY;
                })();
                ui.layout.pageEventScroll.forEach(func => {
                    func && func();
                });
            },
            eventResize: function () {
                areaWidth = window.innerWidth, areaHeight = window.innerHeight;
                document.documentElement.style.setProperty("--viewport-ratio", areaWidth / areaHeight);
                document.documentElement.style.setProperty("--vh-100", areaHeight + "px");
                document.documentElement.style.setProperty("--vh", (areaHeight / 100) + "px");
                ui.layout.pageEventResize.forEach(func => {
                    func && func();
                });
            },
            eventFormSelectPlaceholder: function (e) {
                if (!e.target.nodeName.match(/select/i)) {
                    return;
                }
                if (e.target.options[e.target.selectedIndex].innerText.trim() == e.target.getAttribute("placeholder").trim()) {
                    e.target.classList.add("placeholder");
                } else {
                    e.target.classList.remove("placeholder");
                }
            },
            eventClick: function (e) {
                const _target = e.target;
                const _el_top = document.querySelector(".page-top");
                const _el_back = document.querySelector(".page-back button");
                const _data_modal = _target.dataset.modal;
                const _data_scrollmove = _target.dataset.scrollmove;
                const _data_mute = _target.dataset.muteaction;
                if (_target == _el_top) { // top 버튼
                    document.scrollingElement.scroll({top: 0, behavior: "smooth"});
                    e && e.preventDefault();
                } else if (_target == _el_back) { // back 버튼
                    history.back();
                } else if (_data_modal && _target.getAttribute("href")) { // 영상 팝업
                    _target.getAttribute("href") && ui.layer.createMovie({url: _target.getAttribute("href")});
                    e && e.preventDefault();
                }
                if (_data_scrollmove) {
                    const option = ui.dataJsonParse(_data_scrollmove);
                    if (option.target) {
                        option.target = document.querySelector(option.target)
                    }
                    if (!option.target) {
                        option.target = document.scrollingElement;
                    }
                    !option.position && (option.position = "top");
                    let _top, _el_top, _el_height;
                    if (option.position) {
                        _el_top = option.target.offsetTop;
                        _el_height = option.target.scrollHeight;
                        _top = option.position == "bottom" ? _el_top + _el_height - areaHeight : _el_top;
                    }
                    window.scrollTo({top: _top, behavior: 'smooth'});
                }
                if (_data_mute) {
                    let _el_video = _target.closest(_data_mute);
                    if (_el_video) {
                        _el_video = _el_video.querySelector("video");
                        _el_video && (_el_video.muted = !_el_video.muted);
                    }
                }
                if (e.target.id === 'email') {
                    const email = document.querySelector('.contact-us #email');
                    email.classList.remove('email_error');
                }
            },
            setEvent: function () {
                this.eventResizeTimer = (e) => {
                    setTimeout(() => {
                        ui.layout.eventResize.call(ui.layout, e)
                    }, 500)
                };
                window.removeEventListener('scroll', this.eventScroll);
                window.removeEventListener('resize', this.eventResize);
                window.removeEventListener('orientationchange', this.eventResizeTimer);
                window.addEventListener('scroll', this.eventScroll);
                window.addEventListener('resize', this.eventResize);
                window.addEventListener('orientationchange', this.eventResizeTimer);
                this.eventScroll.call(this);
                this.eventResize.call(this);

                // click Event
                $body.removeEventListener('click', this.eventClick);
                $body.addEventListener('click', this.eventClick);
                // <select> 버튼 placeholder 기능
                $body && $body.removeEventListener('input', this.eventFormSelectPlaceholder);
                $body && $body.addEventListener('input', this.eventFormSelectPlaceholder);
                document.querySelectorAll("select").forEach((el) => {
                    ui.layout.eventFormSelectPlaceholder.call(el, {target: el, type: null});
                });
            }
        },
        initCountrySelect: () => {
            let selectTags = '';
            const countrySelectNode = document.querySelector('.fm-row #country');
            const firstElement = '<option value="placeholder" hidden>Country</option>';
            selectTags += firstElement;
            countries.forEach((country) => {
                const element = `<option value="${country.code}">${country.name}</option>`;
                selectTags += element;
            });
            countrySelectNode.innerHTML = selectTags;
        },
        init: function () {
            location.search.replace(/^\?/, '').replace(/#.*/, '').split("&").forEach((item) => {
                const _q = item.split("=");
                if (_q.length > 1) ui.query[_q[0]] = (_q[0] == "sec" ? "section-" : "") + _q[1];
            });
            document.querySelectorAll("[data-ani=splitText]").forEach(this.splitLetters); // 단어별로 움직임이 있는 영역 띄어쓰기 기준으로 span 추가.
            $header && this.layout.header.init();
            this.layout.commonBg.init();
            !isTouchSupported && this.smoothScroll.init();
            this.setScrollTrigger("scrollplay"); // 스크롤 위치에 따른 movie play.
            this.setScrollTrigger("scrolltoggle"); // 스크롤 위치에 따른 엘리먼트 class toggle.
            this.setScrollTrigger("scrollper"); // 스크롤 위치에 따른 엘리먼트 viewport 퍼센트 계산. 움직임은 css에서 사용.
            this.setIndicator("indicator"); // 메인 현재 섹션 위치 계산
            this.setDropdown("dropdown"); // 언어선택/햄버거 메뉴 등에 사용되는 dropdown.
            this.setAniAccordion.call(this.layout, "[data-scrollaccordion]", "dt"); // 메인 아코디언
            this.setAniDelay(); // [data-scrolltoggle] > [data-ani] 요소의 움직임 지연 시간 계산.
            this.setTab("tab"); // 탭 관련 세팅.
            this.layout.setEvent();
            this.setSwiper("swiper");
            this.setValidCheck("validcheck");
            this.setVideoEvent(document.querySelectorAll("video"));
            this.initCountrySelect();

            $container && $container.dataset.page && $body.setAttribute("data-page", $container.dataset.page); // container에 정의된 data-page body에 추가.
            $html && $html.classList.add("page-initialized", "page-init-ani"), setTimeout(() => {
                $html.classList.remove("page-init-ani");
            }, 1000);

            // location.search에 sec 값이 있을 경우. 해당 id 위치로 스크롤 이동.
            setTimeout(() => {
                if (ui.query.sec && document.getElementById(ui.query.sec)) {
                    const _el = document.getElementById(ui.query.sec).closest(".tab-cont-wrap") || document.getElementById(ui.query.sec);
                    let _top = _el.getBoundingClientRect().top, _sc = document.scrollingElement.scrollTop;
                    document.scrollingElement.scroll({top: (_sc + _top) - 120, behavior: "smooth"});
                } else {
                    document.scrollingElement.scroll({top: 0, behavior: "smooth"});
                }
            }, 1000);
        }
    };

    // gsap.registerPlugin(ScrollTrigger);
    ui.init();

    // PUBLIC
    HANCOMUI.confirm = ui.system.confirm;
    HANCOMUI.alert = ui.system.alert;
    HANCOMUI.toast = ui.system.toast;
    HANCOMUI.layer = {hide: ui.layer.hide, show: ui.layer.show};


    const sendMail = (fromName, fromEmail, companyName, interest, country, message, langText) => {
            fetch('https://www-staging.hancom.com/' + 'fmail/sendInquiry.do', {
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            method: 'POST',
            body: JSON.stringify({
                from: fromEmail,
                fromName: fromName,
                companyName: companyName,
                interest: interest,
                country: country,
                subject: `Hancom global inquiry: ${fromName} / ${companyName} / ${interest}`,
                message: message,
                locale: langText
            }),
            // mode: 'no-cors'
        }).then(response => {
            response.text();
        }).then(data => {
            HANCOMUI.alert({
                msg: 'Thank you for your interest in Hancom.',
                buttonId: 'inquiry_sent',
                callback: document.querySelector('.contact-us .dropdown-close').click()
            });
            console.log(data)
        });
    }


    const prepareSendMail = () => {
        const emailRegex = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

        const name = document.querySelector('.contact-us #name');
        const email = document.querySelector('.contact-us #email');
        if (!emailRegex.test(email.value)) {
            email.classList.add('email_error');
            return false;
        } else {
            email.classList.remove('email_error');
        }
        const companyName = document.querySelector('.contact-us #companyName');
        const interest = document.querySelector('.contact-us #interest');
        let interestText = interest.options[interest.selectedIndex].text;
        if (interest.value == 'placeholder') {
            interestText = 'Interest';
        }
        const country = document.querySelector('.contact-us #country');
        const countryText = country.options[country.selectedIndex].text;
        const lang = document.querySelector('.lang .dropdown-handle');
        const langText = lang.innerText;
        const message = document.querySelector('.contact-us #message');
        const checkbox = document.querySelector('.mg-ty #checkbox');
        checkbox.checked = false;

        sendMail(name.value, email.value, companyName.value, interestText, countryText, message.value, langText);

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'company_name': companyName.value,
            'interest': interestText,
            'country': countryText
        });

        name.value = '';
        email.value = '';
        companyName.value = '';
        interest.value = 'placeholder';
        interest.classList.add('placeholder');
        message.value = '';
        country.value = 'placeholder';
        country.classList.add('placeholder');

		const send_inquiry = document.querySelector('.contact-us #send_inquiry');
		send_inquiry.disabled = true;
        return true;
    }

    HANCOMUI.prepareSendMail = prepareSendMail;

})(window);
