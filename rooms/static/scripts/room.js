'use strict';
var YouTubeIframeAPIReady = !1
  , DocumentReady = !1;
document.addEventListener("DOMContentLoaded", function() {
    DocumentReady = !0,
    YouTubeIframeAPIReady && Init()
});
function onYouTubeIframeAPIReady() {
    YouTubeIframeAPIReady = !0,
    DocumentReady && Init()
}
function Init() {
    var p = Math.abs
      , u = Math.floor;
    function a(b) {
        var c = g("div");
        c.classList.add("popup_bg");
        var d = g("div");
        d.classList.add("popup_m"),
        d.textContent = b;
        var e = g("div")
          , f = g("a");
        f.setAttribute("href", "/"),
        f.textContent = "Back to Home",
        e.appendChild(f),
        d.appendChild(e),
        c.appendChild(d),
        document.body.appendChild(c),
        document.body.style.overflow = "hidden"
    }
    function b(a, b, c, d) {
        this.id = a,
        this.name = b,
        this.color = c,
        this.group = d,
        this.ready = !0,
        this.list_element,
        this.list_element_name,
        this.loading_element;
        var f = g("li");
        f.classList.add("user"),
        f.setAttribute("id", a);
        var e = g("div");
        e.classList.add("name"),
        e.textContent = b,
        this.list_element_name = e,
        a == s.id && (s.user = this,
        e.style.fontWeight = "bold"),
        f.appendChild(e),
        f.style.borderRight = "5px solid " + z.groupColors[d];
        var h = g("img");
        h.setAttribute("src", "/img/loading.gif"),
        this.loading_element = h,
        f.appendChild(h),
        this.list_element = f,
        z.user_list.appendChild(f),
        z.user_count.textContent = z.user_list.childElementCount + " Users",
        F.users.set(a, this),
        this.Delete = function() {
            var a = this.list_element;
            a.classList.add("scaleout"),
            F.users.delete(this.id),
            setTimeout(function() {
                z.user_list.removeChild(a)
            }, 300),
            z.user_count.textContent = z.user_list.childElementCount - 1 + " Users"
        }
        ,
        this.setName = function(a) {
            this.name = a,
            this.list_element_name.textContent = a
        }
        ,
        this.setGroup = function(a) {
            s.user.id == this.id && I.GroupRefresh(this, a),
            this.group = a,
            this.list_element.style.borderRight = "5px solid " + z.groupColors[a]
        }
        ,
        this.hasPermission = function(a) {
            return F.permissions[a].includes(this.group)
        }
        ,
        this.isOwner = function() {
            return 2 == this.group
        }
    }
    function c(a, b) {
        let c = a.indexOf(b);
        return -1 !== c && (a.splice(c, 1),
        !0)
    }
    function d(a) {
        return document.querySelector(a)
    }
    function f(a) {
        return document.querySelectorAll(a)
    }
    function g(a, b) {
        var c = document.createElement(a);
        return void 0 !== b && (c.className = b),
        c
    }
    function h(a) {
        a.parentNode.removeChild(a)
    }
    function i(a) {
        for (var b = a.lastElementChild; b; )
            a.removeChild(b),
            b = a.lastElementChild
    }
    function j(a, b) {
        fetch(a).then(function(a) {
            return a.json()
        }).then(function(a) {
            b(a)
        })
    }
    function k(a, b, c, d) {
        a.addEventListener("mouseenter", function(d) {
            var e = d.target;
            null != e && e.parentNode == a && (e.nodeName == b || e.className == b) && c(e)
        }, !0),
        a.addEventListener("mouseleave", function(c) {
            var e = c.target;
            null != e && e.parentNode == a && (e.nodeName == b || e.className == b) && d(e)
        }, !0)
    }
    function l(a, c, d) {
        var e, h, j, k = u(6 * a), i = 6 * a - k, f = d * (1 - c), l = d * (1 - i * c), m = d * (1 - (1 - i) * c);
        switch (k % 6) {
        case 0:
            e = d,
            h = m,
            j = f;
            break;
        case 1:
            e = l,
            h = d,
            j = f;
            break;
        case 2:
            e = f,
            h = d,
            j = m;
            break;
        case 3:
            e = f,
            h = l,
            j = d;
            break;
        case 4:
            e = m,
            h = f,
            j = d;
            break;
        case 5:
            e = d,
            h = f,
            j = l;
        }
        return [255 * e, 255 * h, 255 * j]
    }
    function m(a, c, e) {
        var f = Math.min
          , i = Math.max;
        a /= 255,
        c /= 255,
        e /= 255;
        var j, k, l = i(a, c, e), m = f(a, c, e), n = l - m;
        return k = 0 == l ? 0 : n / l,
        l == m ? j = 0 : (l === a ? j = (c - e) / n + (c < e ? 6 : 0) : l === c ? j = (e - a) / n + 2 : l === e ? j = (a - c) / n + 4 : void 0,
        j /= 6),
        [j, k, l]
    }
    function n(a) {
        return 0 > a && (a = 0),
        1 < a && (a = 1),
        a
    }
    function o(a, b, c, d, e) {
        return (a - b) / (c - b) * (e - d) + d
    }
    var v = new function() {
        this.Start = function() {
            if (this.env = M.get("ws.env"),
            this.ws_address = M.get("ws.host"),
            "production" == this.env)
                window.ga = window.ga || function() {
                    (ga.q = ga.q || []).push(arguments)
                }
                ,
                ga.l = +new Date,
                ga("create", "UA-132357868-1", "auto"),
                ga("send", "pageview", {
                    page: "/rooms/*"
                });
            else {
                var a = g("div");
                a.textContent = "env " + ("development" == this.env ? this.env : "local"),
                a.style.position = "fixed",
                a.style.left = "1em",
                a.style.bottom = "1em",
                a.style.fontSize = ".8em",
                a.style.color = "gray",
                a.style.pointerEvents = "none",
                document.body.appendChild(a)
            }
            s.Init()
        }
    }
      , w = new function() {
        function a() {
            f.parentNode.classList.remove("chat_disabled")
        }
        function b() {
            f.parentNode.classList.add("chat_disabled"),
            f.value = "",
            f.blur(),
            y.HidePopup()
        }
        function c(a) {
            if (0 < a.length)
                for (var b = 0; b < a.length; b++)
                    w.Log(a[b])
        }
        var f = d("#chat_input")
          , h = d("#chat_log");
        this.userCountLimit = 30,
        this.preventSpam = !1,
        this.Init = function(e) {
            y.Init(),
            c(e),
            f.onkeydown = function(a) {
                if ("Enter" == a.key) {
                    var b = f.value;
                    if (!b.startsWith("/"))
                        512 < b.length && (b = b.substring(0, 512)),
                        b.trim() && s.Send("chat", {
                            msg: b
                        });
                    else if ("/debug" == b && null == d(".btnDisconnect")) {
                        var a = g("button", "btnDisconnect");
                        a.textContent = "Disconnect",
                        a.style.position = "fixed",
                        a.style.bottom = "0",
                        a.style.left = "0",
                        document.body.appendChild(a),
                        a.onclick = function() {
                            s.socket.close()
                        }
                    }
                    f.value = "",
                    y.HidePopup()
                }
            }
            ,
            s.on("chat", function(a) {
                w.Log(a)
            }),
            I.OnPermissionChange("chat", function(c) {
                c.group == s.user.group && (c.val ? a() : b())
            }),
            s.user.hasPermission("chat") || f.parentNode.classList.add("chat_disabled")
        }
        ,
        this.Resync = function(d) {
            i(h),
            c(d),
            s.user.hasPermission("chat") ? a() : b()
        }
        ,
        this.Log = function(a) {
            50 == h.childElementCount && h.removeChild(h.childNodes[0]);
            var b = a.user
              , c = a.msg
              , d = g("li")
              , e = g("span");
            e.style.fontWeight = "bold",
            e.style.color = "rgb(" + b.color[0] + "," + b.color[1] + "," + b.color[2] + ")",
            e.textContent = b.name,
            d.appendChild(e);
            var f = g("span");
            f.style.color = "rgb(180,180,180)",
            f.textContent = ": ",
            d.appendChild(f);
            for (var j, k = 0; k < c.length; k++)
                switch (j = c[k],
                j.type) {
                case "text":
                    var l = g("span");
                    l.classList.add("text"),
                    l.textContent = j.txt + " ",
                    d.appendChild(l);
                    break;
                case "url":
                    var m = g("a");
                    m.href = j.url,
                    m.target = "_blank",
                    m.textContent = j.url,
                    d.appendChild(m);
                    break;
                case "emote":
                    var n = g("span");
                    n.classList.add("emote");
                    var o = g("img");
                    o.setAttribute("src", "../img/emotes/" + j.id),
                    n.appendChild(o),
                    d.appendChild(n);
                }
            h.appendChild(d),
            h.scrollTop = h.scrollHeight,
            "chat" != z.activeNav && t.Add("chat", 1)
        }
        ,
        this.LogInfo = function(a, b) {
            50 == h.childElementCount && h.removeChild(h.childNodes[0]);
            var c = g("li")
              , d = g("span");
            "%" == a[0] && "b" == a[1] && (d.style.fontWeight = "bold",
            a = a.substring(2)),
            d.textContent = a,
            d.style.color = b,
            c.appendChild(d),
            h.appendChild(c),
            h.scrollTop = h.scrollHeight
        }
    }
      , x = new function() {}
      , y = new function() {
        function a(a) {
            for (var c in null === h ? fetch("/json/emoji.json").then(function(a) {
                return a.json()
            }).then(function(a) {
                h = a,
                b(h),
                f = !1
            }) : (b(h),
            f = !1),
            a) {
                let b = c;
                var d = a[b]
                  , i = g("li")
                  , e = g("img");
                e.setAttribute("src", "../img/emotes/" + d),
                i.appendChild(e),
                i.setAttribute("e_id", b),
                k.appendChild(i)
            }
        }
        function b(a) {
            for (var b, c = d(".defaultEmojis"), f = 0; f < a.emoji.length; f++)
                b = g("p"),
                b.textContent = a.emoji[f],
                c.appendChild(b)
        }
        var c = d("#chat_input")
          , f = !1
          , h = null
          , j = d(".emotes")
          , k = d(".customEmojis");
        this.Init = function() {
            var b = d("#btn_chat_emotes");
            j.addEventListener("transitionend", function(a) {
                a.target == j && (j.classList.contains("visible") || (j.style.display = "none"))
            }),
            b.onclick = function() {
                j.classList.contains("visible") ? (j.classList.remove("visible"),
                i(d(".defaultEmojis")),
                i(k)) : (j.style.display = "block",
                j.offsetHeight,
                j.classList.add("visible"),
                !f && (s.Send("emotes", ""),
                f = !0))
            }
            ,
            j.style.display = "none",
            d(".defaultEmojis").addEventListener("click", function(a) {
                "P" != a.target.tagName || (c.value += a.target.textContent,
                c.focus())
            }),
            d(".customEmojis").addEventListener("click", function(a) {
                if ("LI" == a.target.parentNode.tagName) {
                    var b = c.value;
                    0 < b.length && " " != b[b.length - 1] && (b += " "),
                    c.value = b + a.target.parentNode.getAttribute("e_id") + " ",
                    c.focus()
                }
            }),
            s.on("emotes", function() {
                a({
                    Doge: "Doge.png",
                    HeavyBreathing: "HeavyBreathing.png"
                })
            })
        }
        ,
        this.HidePopup = function() {
            j.classList.remove("visible"),
            i(d(".defaultEmojis")),
            i(k)
        }
    }
      , z = new function() {
        this.groupColors = ["rgb(56, 56, 56)", "rgb(80, 55, 4)", "rgb(75, 11, 11)"],
        this.user_list = d("#user_list"),
        this.user_count = d(".userCount"),
        this.room_name = d(".roomName"),
        this.nav = d("header .tabs"),
        this.activeNav = "chat"
    }
      , q = new function() {
        function a() {}
        var b = d(".login_form")
          , c = d(".btn_login")
          , f = !1;
        this.Init = function() {
            b.addEventListener("transitionend", function(a) {
                a.target == b && (f || (b.style.display = "none"))
            }),
            c.addEventListener("click", function() {
                a(),
                f && q.Hide()
            })
        }
        ,
        this.Show = function() {
            E.Show(),
            b.style.display = "block",
            b.offsetHeight,
            b.classList.add("login_form_visible"),
            f = !0,
            E.currentPopup = this
        }
        ,
        this.Hide = function() {
            E.Hide(),
            b.classList.remove("login_form_visible"),
            f = !1
        }
    }
      , r = new function() {
        function a() {
            f.insertAdjacentElement("beforeEnd", e),
            c.insertAdjacentElement("beforeEnd", h)
        }
        function b() {
            c.insertAdjacentElement("beforeEnd", e),
            g.insertAdjacentElement("beforeEnd", h)
        }
        var c = d("header")
          , e = d("#main_nav")
          , f = d(".center")
          , g = d(".search_input_wrapper")
          , h = d(".search_result_wrapper")
          , i = window.matchMedia("(max-width:992px)");
        this.Init = function() {
            i.addListener(function(c) {
                c.matches ? a() : b()
            }),
            i.matches && a()
        }
    }
      , s = new function() {
        function b() {
            if (!s.kicked)
                if (s.connected)
                    s.Send("ping", "");
                else if (!s.connecting) {
                    if (12 <= f)
                        return 12 == f && w.LogInfo("%bReconnect failed. You may try to reload the page."),
                        void f++;
                    0 == f && (w.LogInfo("%bConnection lost"),
                    w.LogInfo("%bReconnecting...")),
                    s.Connect(),
                    f++
                }
        }
        function c(a, b) {
            for (var c = 0; c < e.length; c++)
                e[c].cmd == a && e[c].callback(b)
        }
        this.socket = null,
        this.connected = !1,
        this.connecting = !1,
        this.loggedIn = !1,
        this.kicked = !1,
        this.id,
        this.user;
        var e = []
          , f = 0;
        this.Init = function() {
            this.pingInterval = setInterval(b, 4e3),
            window.onbeforeunload = function() {
                s.socket.close(),
                s.connected = !1
            }
            ,
            this.Connect()
        }
        ,
        this.Connect = function() {
            "WebSocket"in window && (null !== s.socket && s.socket.close(),
            s.connecting = !0,
            s.socket = new WebSocket(v.ws_address),
            s.socket.onopen = function() {
                s.connected = !0,
                s.connecting = !1
            }
            ,
            s.socket.onmessage = function(a) {
                var b = a.data
                  , d = b.indexOf("{");
                if (-1 != d) {
                    var e = b.substring(d);
                    c(b.substring(0, d), JSON.parse(e))
                } else
                    c(b, -1)
            }
            ,
            s.socket.onclose = function() {
                s.connected = !1,
                s.connecting = !1
            }
            )
        }
        ,
        this.on = function(a, b) {
            e.push({
                cmd: a,
                callback: b
            })
        }
        ,
        this.Send = function(a, b) {
            s.connected && (s.socket.send(a + ("" == b ? "" : JSON.stringify(b))),
            "ping" != a)
        }
        ,
        this.on("auth", function(a) {
            s.id = a.clientId,
            s.group = a.group,
            s.settings = a.room.userSettings,
            f = 0,
            F.Init(a.room),
            s.connected = !0,
            s.connecting = !1,
            z.user_list.childElementCount <= w.userCountLimit && w.LogInfo(s.user.name + " joined the room", "rgb(100,100,100)")
        }),
        this.on("kick", function() {
            s.kicked = !0,
            h(d("main")),
            h(d("footer")),
            h(d("header")),
            h(d(".overlay")),
            a("You were kicked from this room :(")
        }),
        this.hasPermission = function(a) {
            return F.permissions[a].includes(s.group)
        }
        ,
        this.isOwner = function() {
            return 2 == s.group
        }
    }
      , t = new function() {
        var a = {
            playlist: !1,
            chat: !1,
            current: !1
        };
        this.Init = function() {
            a.chat = d("div[t='chat'] .notify"),
            a.chat.setAttribute("val", 0),
            a.playlist = d("div[t='playlist'] .notify"),
            a.playlist.setAttribute("val", 0),
            z.nav.addEventListener("tabchange", function(b) {
                z.activeNav = b.detail;
                var b = a[b.detail];
                b.setAttribute("val", 0),
                b.classList.remove("visible")
            })
        }
        ,
        this.Add = function(b, c) {
            var d = a[b]
              , e = parseInt(d.getAttribute("val")) + c;
            d.setAttribute("val", e),
            d.textContent = "+" + e,
            d.classList.add("visible")
        }
        ,
        this.Subtract = function(b, c) {
            var d = a[b];
            c = parseInt(d.getAttribute("val")) - c,
            d.setAttribute("val", c),
            0 < c && (d.textContent = "+" + c),
            0 >= c && d.classList.remove("visible")
        }
        ,
        this.Reset = function() {
            a.playlist.setAttribute("val", 0),
            a.playlist.classList.remove("visible"),
            a.chat.setAttribute("val", 0),
            a.chat.classList.remove("visible")
        }
    }
      , A = new function() {
        var a = d(".player")
          , b = d(".btnSkip");
        this.serverPlay = !1,
        this.serverPause = !1,
        this.serverSeek = !1,
        this.initialPlay = !0,
        this.initialPause = !0,
        this.subtitles = {
            enabled: !1,
            langCode: "en"
        },
        this.Video = {
            id: !1,
            time: 0,
            duration: 0,
            playing: !1
        },
        this.state = -1,
        this.Init = function(c) {
            s.settings.subtitles !== void 0 && (A.subtitles = s.settings.subtitles),
            c.hasVideo && (A.Video.playing = c.playing,
            A.Video.time = c.time,
            A.Load(c.video)),
            b.onclick = function() {
                s.Send("skip", "")
            }
            ;
            var d, e = !1;
            a.onmouseenter = function() {
                A.Video.id && s.user.hasPermission("skip") && 0 < D.getList().size && b.classList.add("btnSkip_visible"),
                e = !0
            }
            ,
            a.onmouseleave = function() {
                e = !1,
                clearTimeout(d),
                d = setTimeout(function() {
                    e || b.classList.remove("btnSkip_visible")
                }, 3e3)
            }
            ,
            s.on("sync", function(a) {
                A.Sync(a.time)
            }),
            s.on("play", function() {
                A.serverPlay = !0,
                A.serverPause = !1,
                A.Play()
            }),
            s.on("pause", function() {
                A.serverPause = !0,
                A.serverPlay = !1,
                A.Pause()
            }),
            s.on("seek", function(a) {
                A.serverSeek = !0,
                A.Seek(a.time)
            }),
            s.on("clear", function() {
                A.Clear()
            }),
            s.on("loadVideo", function(a) {
                A.Video.playing = !0,
                A.Load(a)
            }),
            s.on("setDuration", function(a) {
                A.Video.duration = a.duration,
                A.Video.requestDuration = !1
            })
        }
        ,
        this.Resync = function(a) {
            a.hasVideo ? (A.Video.playing = a.playing,
            A.Video.time = a.time,
            a.playing ? this.Play() : this.Pause(),
            this.Video.id != a.video.id && A.Load(a.video)) : A.id && (this.Seek(this.Video.duration),
            this.Clear()),
            initPermissions()
        }
        ,
        this.Load = function(a) {
            A.Video.id = a.id,
            A.Video.uuid = a.uuid,
            A.Video.duration = a.duration,
            A.Video.requestDuration = a.requestDuration,
            A.initialPlay = !0,
            A.initialPause = !0,
            A.serverPlay = !1,
            A.serverPause = !1,
            C.player ? C.player.loadVideoById(a.id) : C.Init(),
            d(".novideo").classList.remove("visible"),
            B.Set(a.title, ""),
            0 == D.getList().size && b.classList.remove("btnSkip_visible")
        }
        ,
        this.Sync = function(a) {
            if (C.ready) {
                A.state = C.player.getPlayerState();
                var b = p(a - C.player.getCurrentTime());
                1 < b && (1 == A.state || 2 == A.state) && A.Seek(a)
            }
            A.Video.time = a
        }
        ,
        this.Play = function() {
            C.player && (A.Video.playing = !0,
            C.player.playVideo())
        }
        ,
        this.Pause = function() {
            C.player && (A.Video.playing = !1,
            C.player.pauseVideo())
        }
        ,
        this.Seek = function(a) {
            C.player && C.ready && (C.player.seekTo(a),
            A.Video.time = a)
        }
        ,
        this.Clear = function() {
            A.Video.id = !1,
            b.classList.remove("btnSkip_visible")
        }
    }
      , B = new function() {
        function a(a) {
            a ? (b.textContent = "Show less",
            e.classList.add("videoDescriptionExpanded")) : (b.textContent = "Show more",
            e.classList.remove("videoDescriptionExpanded")),
            f = a
        }
        var b = d(".readMore")
          , c = d(".videoTitle")
          , e = d(".videoDescription")
          , f = !1;
        this.Init = function() {
            b.onclick = function() {
                a(!f)
            }
        }
        ,
        this.Set = function(f, g) {
            a(!1),
            c.textContent = f,
            e.textContent = g,
            e.scrollHeight > e.clientHeight ? (b.style.display = "block",
            a(!1)) : (b.style.display = "none",
            a(!0))
        }
    }
      , C = new function() {
        function a() {
            C.player.playVideo(),
            C.ready = !0,
            C.player.setVolume(20)
        }
        function b() {
            s.user.hasPermission("play") ? s.Send("play", "") : (A.serverPause = !0,
            A.Pause())
        }
        function c() {
            s.user.hasPermission("play") ? s.Send("pause", "") : (A.serverPlay = !0,
            A.Play())
        }
        function d(a) {
            if (a.data == YT.PlayerState.PLAYING && (A.initialPlay ? (!A.Video.playing && (A.serverPause = !0,
            A.Pause()),
            A.initialPlay = !1) : !A.serverPlay && !A.Video.playing && b(),
            A.serverPlay = !1),
            a.data == YT.PlayerState.PAUSED) {
                var d = !1;
                !A.serverSeek && 3 <= p(A.Video.time - C.player.getCurrentTime()) && s.user.hasPermission("seek") && (s.Send("seek", {
                    time: C.player.getCurrentTime()
                }),
                d = !0,
                A.serverPlay = !0,
                A.Play()),
                d || (A.initialPlay ? (A.Video.playing && (A.serverPlay = !0,
                A.Play()),
                A.initialPlay = !1) : !A.serverPause && A.Video.playing && c(),
                A.serverPause = !1)
            }
            0 < a.data && 4 > a.data && (3 == a.data && 3 != h && s.Send("setReady", {
                state: !1
            }),
            (1 == a.data || 2 == a.data) && 3 == h && (s.Send("setReady", {
                state: !0
            }),
            A.Video.requestDuration && s.Send("videoDuration", {
                id: A.Video.uuid,
                duration: C.player.getDuration()
            })),
            h = a.data),
            A.serverSeek = !1
        }
        function e() {}
        function f() {}
        function g() {}
        var h = 3;
        this.player = !1,
        this.ready = !1,
        this.cc = !1,
        this.ccLoaded = !1,
        this.Init = function() {
            C.player = new YT.Player("player",{
                height: "100%",
                width: "100%",
                host: "https://www.youtube-nocookie.com",
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                    disablekb: 1,
                    enablejsapi: 1,
                    iv_load_policy: 3,
                    origin: "https://sync-tube.de",
                    start: A.Video.time,
                    'playsinline': 1
                },
                videoId: A.Video.id,
                events: {
                    onReady: a,
                    onStateChange: d,
                    onPlaybackQualityChange: e,
                    onError: f,
                    onApiChange: g
                }
            })
        }
        ;
        this.GetId = function(a) {
            var b = a.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
            return null != b && 2 < b.length ? b[2] : null
        }
        ,
        this.GetTimestamp = function(a) {
            var b = a
              , c = u(b / 3600);
            b %= 3600;
            var d = u(b / 60)
              , e = u(b % 60);
            return 10 > e && (e = "0" + e),
            10 > d && 0 < c && (d = "0" + d),
            0 < c ? c += ":" : c = "",
            c + d + ":" + e
        }
    }
      , D = new function() {
        function a() {
            h = g("div"),
            h.classList.add("playlist_video_options"),
            m = g("div"),
            m.classList.add("playlist_options_left"),
            i = g("div"),
            i.classList.add("playlist_btn_up"),
            i.classList.add("playlist_btn_arrow"),
            m.appendChild(i),
            i.onclick = function() {
                null != q && s.Send("moveVideo", {
                    uuid: q.uuid,
                    dir: 1
                })
            }
            ,
            j = g("div"),
            j.classList.add("playlist_btn_down"),
            j.classList.add("playlist_btn_arrow"),
            m.appendChild(j),
            j.onclick = function() {
                null != q && s.Send("moveVideo", {
                    uuid: q.uuid,
                    dir: -1
                })
            }
            ,
            l = g("div"),
            l.textContent = "Remove",
            l.classList.add("playlist_btn_remove"),
            l.onclick = function() {
                null != q && s.Send("removeVideo", {
                    uuid: q.uuid
                })
            }
            ,
            h.appendChild(m),
            h.appendChild(l)
        }
        function b(a) {
            0 < a.length && n.classList.remove("visible");
            for (var b, d = 0; d < a.length; d++)
                b = a[d],
                c(b)
        }
        function c(a) {
            var b = g("li");
            b.setAttribute("id", a.uuid),
            a.list_element = b;
            var c = g("div");
            c.classList.add("thumbnail");
            var d = g("img");
            if (d.setAttribute("src", "https://img.youtube.com/vi/" + a.id + "/mqdefault.jpg"),
            c.appendChild(d),
            !a.requestDuration) {
                var e = g("div");
                e.classList.add("duration"),
                e.textContent = C.GetTimestamp(a.duration),
                c.appendChild(e)
            }
            b.appendChild(c);
            var f = g("div");
            f.classList.add("desc");
            var h = g("div");
            h.classList.add("title"),
            h.textContent = a.title,
            f.appendChild(h);
            var i = g("div");
            i.classList.add("info"),
            i.textContent = "Added by " + a.sender.name,
            f.appendChild(i),
            b.append(f),
            o.appendChild(b),
            p.set(a.uuid, a),
            1 == p.size && n.classList.remove("visible"),
            "playlist" != z.activeNav && t.Add("playlist", 1)
        }
        function e(a) {
            var b = o.querySelector("[id=\"" + a.uuid + "\"]");
            b.classList.add("scaleout"),
            setTimeout(function() {
                b.remove()
            }, 300),
            1 == p.size && n.classList.add("visible"),
            "playlist" != z.activeNav && t.Subtract("playlist", 1),
            p.delete(a.uuid)
        }
        function f(a, b) {
            if (p.has(a)) {
                var c = p.get(a)
                  , d = c.list_element;
                d.style.animation = "none",
                0 < b ? d.previousElementSibling && (d.previousElementSibling.style.animation = "none",
                d.parentNode.insertBefore(d, d.previousElementSibling)) : d.nextElementSibling && (d.nextElementSibling.style.animation = "none",
                d.parentNode.insertBefore(d.nextElementSibling, d))
            }
        }
        var h, i, j, l, m, n = d(".noplaylist"), o = d("#video_list"), p = new Map, q = null;
        this.getList = function() {
            return p
        }
        ,
        this.Init = function(d) {
            b(d),
            s.on("addVideo", function(a) {
                c(a)
            }),
            s.on("removeVideo", function(a) {
                e(a)
            }),
            s.on("moveVideo", function(a) {
                f(a.uuid, a.dir)
            }),
            k(o, "LI", function(a) {
                if (p.has(a.id)) {
                    var b = p.get(a.id);
                    l.style.display = b.sender.id == s.user.id || s.user.hasPermission("rem") ? "block" : "none",
                    m.style.display = s.user.hasPermission("move") ? "block" : "none",
                    q = b,
                    a.appendChild(h)
                }
            }, function(a) {
                q = null,
                a.removeChild(h)
            }),
            a()
        }
        ,
        this.Resync = function(a) {
            p.forEach(function(a) {
                a.list_element.remove()
            }),
            p.clear(),
            b(a)
        }
    }
      , E = new function() {
        var a = d(".overlay_background")
          , b = !1;
        this.currentPopup = null,
        this.Init = function() {
            a.addEventListener("transitionend", function(c) {
                c.target == a && (b || (a.style.display = "none"))
            }),
            a.onclick = function() {
                null != E.currentPopup && (E.currentPopup.Hide(),
                E.currentPopup = null)
            }
        }
        ,
        this.Show = function() {
            b || (a.style.display = "block",
            a.offsetHeight,
            a.classList.add("overlay_visible"),
            b = !0)
        }
        ,
        this.Hide = function() {
            b && (a.classList.remove("overlay_visible"),
            b = !1)
        }
    }
      , F = new function() {
        this.id = window.location.pathname.split("/")[2],
        this.name = "",
        this.mode = 1,
        this.users = new Map,
        this.permissions,
        this.initialized = !1,
        this.Init = function(a) {
            F.SetName(a.title),
            this.mode = a.mode,
            this.permissions = a.permissions,
            this.initialized ? (I.Resync(),
            t.Reset(),
            L.Resync(a.users),
            D.Resync(a.playlist),
            w.Resync(a.log),
            A.Resync(a.player)) : (r.Init(),
            L.Init(a.users),
            A.Init(a.player),
            t.Init(),
            K.Init(),
            I.Init(a.userSettings),
            D.Init(a.playlist),
            w.Init(a.log),
            B.Init(),
            G.Init(),
            z.user_list.childElementCount > w.userCountLimit && (w.LogInfo("%bThere are more than " + w.userCountLimit + " users in this room. Join/Leave messages won't be shown to prevent spam.", "rgb(100,100,100)"),
            w.preventSpam = !0),
            s.on("addUser", function(a) {
                if (!F.users.has(a.id)) {
                    var c = new b(a.id,a.name,[0, 0, 0],a.group);
                    F.initialized && !w.preventSpam && w.LogInfo(c.name + " joined the room", "rgb(100,100,100)"),
                    !w.preventSpam && z.user_list.childElementCount > w.userCountLimit && (w.preventSpam = !0,
                    w.LogInfo("%bThere are more than " + w.userCountLimit + " users in this room. Join/Leave messages won't be shown to prevent spam.", "rgb(100,100,100)"))
                }
            }),
            s.on("removeUser", function(a) {
                F.users.has(a.id) && (F.users.get(a.id).Delete(),
                F.initialized && !w.preventSpam && w.LogInfo(a.name + " left the room", "rgb(100,100,100)"))
            }),
            s.on("roomRename", function(a) {
                F.SetName(a.name)
            }),
            s.on("setGroup", function(a) {
                F.users.has(a.id) && F.users.get(a.id).setGroup(a.group)
            }),
            s.on("shutdown", function() {
                w.LogInfo("%bDown for Maintenance. We will be back shortly.")
            }),
            this.initialized = !0)
        }
        ,
        this.SetName = function(a) {
            this.name = a,
            z.room_name.textContent = a,
            document.title = a + " - SyncTube"
        }
    }
      , G = new function() {
        function a(a) {
            a ? (n.classList.remove("btnNotAllowed"),
            n.disabled = !1) : (l(),
            n.classList.add("btnNotAllowed"),
            n.value = "",
            n.blur(),
            n.disabled = !0),
            G.enabled = a
        }
        function b(a) {
            s.Send("addVideo", {
                id: a
            })
        }
        function c(a) {
            n.value.trim() != p.trim() && a && (i(),
            h(a, function() {
                n === document.activeElement && k()
            })),
            p = n.value
        }
        function f(a, b, d) {
            var f = g("div");
            f.setAttribute("id", a),
            f.classList.add("search_result");
            var e = g("img");
            e.setAttribute("src", "https://i.ytimg.com/vi/" + a + "/mqdefault.jpg");
            var h = g("div");
            h.classList.add("title"),
            h.textContent = b,
            f.appendChild(e);
            var i = g("div");
            i.classList.add("details"),
            i.appendChild(h);
            var j = g("div");
            return j.classList.add("channel"),
            j.textContent = d,
            i.appendChild(j),
            f.appendChild(i),
            f
        }
        function h(a, b) {
            j("/json/youtube_oembed?id=" + a, function(c) {
                if (!c.error) {
                    i(),
                    q.push({
                        id: c.id,
                        title: c.title
                    });
                    var d = f(a, c.title, c.author);
                    o.appendChild(d),
                    b(d)
                } else
                    l()
            })
        }
        function i() {
            if (0 < q.length)
                for (q = []; 0 < o.childNodes.length; )
                    o.removeChild(o.lastChild)
        }
        function k() {
            o.style.display = "block",
            o.offsetHeight,
            o.classList.add("visible")
        }
        function l() {
            o.classList.remove("visible")
        }
        var m, n = d(".searchInput"), o = d(".search_result_wrapper"), p = "", q = [], r = !1;
        this.Init = function() {
            s.hasPermission("add") || a(!1),
            I.OnPermissionChange("add", function(b) {
                b.group == s.user.group && a(b.val)
            }),
            o.addEventListener("transitionend", function(a) {
                a.target == o && (o.classList.contains("visible") || (o.style.display = "none"))
            }),
            o.addEventListener("click", function(a) {
                var c = a.target.getAttribute("id");
                n.value = "",
                b(c),
                i(),
                p = ""
            }),
            n.oninput = function() {
                clearTimeout(m),
                r = C.GetId(n.value.trim()),
                r ? c(r) : m = setTimeout(function() {
                    c(!1)
                }, 500)
            }
            ,
            n.onkeydown = function(a) {
                "Enter" == a.key && (r = C.GetId(n.value.trim()),
                c(r),
                r && (i(),
                b(r),
                n.value = "",
                n.blur(),
                l(),
                p = ""))
            }
            ,
            n.onblur = function() {
                l()
            }
            ,
            n.onfocus = function() {
                0 < q.length && k()
            }
        }
    }
      , H = function(a, b) {
        function c(a) {
            var b = f(a, u);
            y.setHue(n(b[0] / C))
        }
        function d(a) {
            var b = f(a, s);
            y.setHSV(E, n(b[0] / C), 1 - n(b[1] / D))
        }
        function f(a, b) {
            var c = b.getBoundingClientRect()
              , d = s.getBoundingClientRect();
            return C = d.width,
            D = d.height,
            [a.clientX - c.left, a.clientY - c.top]
        }
        function i(a) {
            return "rgb(" + a[0] + "," + a[1] + "," + a[2] + ")"
        }
        function j(b) {
            a.style.backgroundColor = b
        }
        function k(a) {
            A.clearRect(0, 0, s.width, s.height);
            var b = A.createLinearGradient(0, 0, s.width, 0);
            b.addColorStop(0, "rgb(" + 255 * H + "," + 255 * H + "," + 255 * H + ")"),
            b.addColorStop(1, a),
            A.fillStyle = b,
            A.fillRect(0, 0, s.width, s.height);
            var c = A.createLinearGradient(0, s.height, 0, 0);
            c.addColorStop(0, "rgba(0,0,0," + I + ")"),
            c.addColorStop(1, "transparent"),
            A.fillStyle = c,
            A.fillRect(0, 0, s.width, s.height)
        }
        var p = g("div", "color_picker_popup");
        p.style.display = "none";
        var q = g("div", "wrapper")
          , r = g("div", "canvas_wrapper")
          , s = g("canvas", "color_canvas")
          , t = g("div", "color_picker_thump");
        r.appendChild(s),
        r.appendChild(t);
        var u = g("div", "hue_slider")
          , v = g("div", "hue_slider_thump");
        u.appendChild(v),
        q.appendChild(r),
        q.appendChild(u),
        p.appendChild(q),
        a.appendChild(p);
        var x, y = this, z = !1, A = s.getContext("2d"), B = s.getBoundingClientRect(), C = B.width, D = B.height, E = 0, F = 0, G = 0, H = .9, I = .5;
        this.onchange,
        this.onpick,
        this.picked_color,
        this.last_color,
        this.visible = !1,
        this.element = p;
        var J;
        a.addEventListener("click", function(b) {
            b.target !== a || (y.visible ? y.hide() : y.show())
        }),
        p.addEventListener("transitionend", function() {
            p.classList.contains("color_picker_popup_visible") || (p.style.display = "none")
        }),
        s.addEventListener("mousedown", function(a) {
            z = !0,
            d(a),
            x = s
        }),
        u.addEventListener("mousedown", function(a) {
            z = !0,
            c(a),
            x = u
        }),
        document.addEventListener("mousemove", function(a) {
            z && (x === u ? c(a) : d(a))
        }),
        document.addEventListener("mouseup", function() {
            z = !1,
            y.onpick !== void 0 && y.picked_color != y.last_color && (y.last_color = y.picked_color,
            y.onpick(y.picked_color))
        }),
        this.show = function() {
            p.style.display = "flex",
            p.clientWidth,
            p.classList.add("color_picker_popup_visible"),
            y.visible = !0
        }
        ,
        this.hide = function() {
            p.classList.remove("color_picker_popup_visible"),
            y.visible = !1
        }
        ,
        this.setRGB = function(a, d, e) {
            var b = m(a, d, e);
            this.setHSV(b[0], b[1], b[2])
        }
        ,
        this.setHSV = function(a, b, c) {
            F = b,
            G = c,
            this.setHue(a),
            t.style.left = 100 * b + "%",
            t.style.top = 100 * (1 - c) + "%"
        }
        ,
        this.setHue = function(a) {
            E = a,
            J = l(E, 1, H),
            k(i(J)),
            y.picked_color = l(E, F, o(G, 0, 1, I, H)),
            j(i(y.picked_color)),
            v.style.left = 100 * E + "%",
            y.onchange !== void 0 && y.onchange()
        }
        ,
        b ? this.setRGB(b[0], b[1], b[2]) : this.setRGB(255, 0, 0)
    }
      , I = new function() {
        function a(a) {
            for (var b = 0; b < n.length; b++)
                n[b].pid == a.pid && n[b].callback(a)
        }
        function b() {
            s.user.isOwner() && I.SetAdminSettingsEnabled(!0);
            for (var a = j.querySelectorAll(".checkbox"), b = 0; b < a.length; b++) {
                var c = a[b]
                  , d = c.id
                  , e = c.parentNode.parentNode.getAttribute("pid")
                  , f = F.permissions[e];
                f.includes(parseInt(d)) ? c.classList.add("checked") : c.classList.remove("checked")
            }
        }
        var e, f = d("#input_userName"), g = d("#input_roomName"), h = d(".settings"), i = h.querySelector(".btnClose"), j = d("#table_permissions"), k = d("#cb_p"), l = d("#cb_rn"), m = !1, n = [];
        this.Init = function(n) {
            d("#btnSettings").addEventListener("click", function() {
                I.Show()
            }),
            h.addEventListener("transitionend", function(a) {
                a.target == h && (m || (h.style.display = "none"))
            }),
            i.addEventListener("click", function() {
                m && I.Hide()
            }),
            f.addEventListener("blur", function() {
                var a = f.value;
                0 < a.trim().length && a != s.user.name && (30 < a.length && (a = a.substring(0, 30)),
                s.Send("userRename", {
                    name: a
                }))
            }),
            f.value = s.user.name,
            e = new H(d(".color_picker"),s.user.color),
            e.onchange = function() {}
            ,
            e.onpick = function(a) {
                a[0] = +a[0].toFixed(2),
                a[1] = +a[1].toFixed(2),
                a[2] = +a[2].toFixed(2),
                s.Send("setColor", {
                    color: a
                })
            }
            ,
            g.addEventListener("blur", function() {
                var a = g.value;
                0 < a.trim().length && a != F.name && (100 < a.length && (a = a.substring(0, 100)),
                s.Send("roomRename", {
                    name: a
                }))
            }),
            g.value = F.name,
            l.addEventListener("click", function(a) {
                s.Send("rememberName", {
                    val: !a.target.classList.contains("checked")
                })
            }),
            s.on("rememberName", function(a) {
                a.val ? l.classList.add("checked") : l.classList.remove("checked")
            }),
            n.persistentName !== void 0 && l.classList.add("checked"),
            1 == F.mode && k.classList.add("checked"),
            k.addEventListener("click", function(a) {
                s.Send("setMode", {
                    mode: a.target.classList.contains("checked") ? 0 : 1
                })
            }),
            s.on("setMode", function(a) {
                1 == a.mode ? k.classList.add("checked") : k.classList.remove("checked")
            }),
            b(),
            j.addEventListener("click", function(a) {
                if (a.target.classList.contains("checkbox")) {
                    var b = a.target.parentNode.parentNode.getAttribute("pid");
                    s.Send("setPermission", {
                        pid: b,
                        group: parseInt(a.target.id),
                        val: !a.target.classList.contains("checked")
                    })
                }
            }),
            s.on("setPermission", function(b) {
                var d = j.querySelector("[pid=" + b.pid + "]")
                  , e = d.querySelector("[id=\"" + b.group + "\"]")
                  , f = F.permissions[b.pid];
                !f.includes(b.group) && b.val ? (f.push(b.group),
                e.classList.add("checked")) : f.includes(b.group) && !b.val && (c(f, b.group),
                e.classList.remove("checked")),
                a({
                    pid: b.pid,
                    group: b.group,
                    val: b.val
                })
            }),
            J.Init()
        }
        ,
        this.OnPermissionChange = function(a, b) {
            n.push({
                pid: a,
                callback: b
            })
        }
        ,
        this.GroupRefresh = function(b, c) {
            for (let d in F.permissions) {
                let e = F.permissions[d];
                e.includes(c) && !e.includes(b.group) ? a({
                    pid: d,
                    group: b.group,
                    val: !0
                }) : !e.includes(c) && e.includes(b.group) && a({
                    pid: d,
                    group: b.group,
                    val: !1
                })
            }
        }
        ,
        this.Resync = function() {
            b()
        }
        ,
        this.Show = function() {
            E.Show(),
            h.style.display = "block",
            h.offsetHeight,
            h.classList.add("settings_visible"),
            m = !0,
            E.currentPopup = this
        }
        ,
        this.Hide = function() {
            E.Hide(),
            e.visible && e.hide(),
            h.classList.remove("settings_visible"),
            m = !1
        }
        ,
        this.SetAdminSettingsEnabled = function(a) {
            for (var b = h.querySelectorAll(".enabled"), c = 0; c < b.length; c++)
                a ? b[c].classList.remove("disabled") : b[c].classList.add("disabled")
        }
    }
      , J = new function() {
        function a() {
            c = g("div"),
            c.classList.add("userListMenu"),
            c.classList.add("noselect");
            var a = g("ul");
            f = g("li"),
            f.classList.add("btnPromote"),
            f.textContent = "Promote",
            f.onclick = function() {
                2 > l.group && (s.Send("setGroup", {
                    id: l.id,
                    group: l.group + 1
                }),
                b())
            }
            ,
            a.appendChild(f),
            h = g("li"),
            h.classList.add("btnDemote"),
            h.textContent = "Demote",
            h.onclick = function() {
                0 < l.group && (s.Send("setGroup", {
                    id: l.id,
                    group: l.group - 1
                }),
                b())
            }
            ,
            a.appendChild(h),
            i = g("li"),
            i.classList.add("btnKick"),
            i.textContent = "Kick",
            i.onclick = function() {
                s.user.hasPermission("kick") && (s.Send("kick", {
                    id: l.id
                }),
                b())
            }
            ,
            a.appendChild(i),
            c.appendChild(a)
        }
        function b() {
            null != c.parentNode && c.parentNode.removeChild(c)
        }
        var c, f, h, i, j = d("#user_list"), l = null;
        this.Init = function() {
            a(),
            k(j, "LI", function(a) {
                if (s.user.isOwner()) {
                    if (!F.users.has(a.id))
                        return;
                    if (l = F.users.get(a.id),
                    l.id == s.user.id)
                        return;
                    a.appendChild(c),
                    2 == l.group ? f.classList.add("disable") : f.classList.remove("disable"),
                    0 == l.group ? h.classList.add("disable") : h.classList.remove("disable"),
                    s.user.hasPermission("kick") ? i.classList.remove("disable") : i.classList.add("disable")
                }
            }, function() {
                b()
            }),
            I.OnPermissionChange("kick", function(a) {
                a.group == s.user.group && (a.val ? i.classList.remove("disable") : i.classList.add("disable"))
            })
        }
    }
      , K = new function() {
        function a() {
            g = !0,
            f.style.display = "block",
            f.offsetHeight,
            c.classList.add("user_btn_selected"),
            f.classList.add("user_popup_menu_visible")
        }
        function b() {
            g = !1,
            c.classList.remove("user_btn_selected"),
            f.classList.remove("user_popup_menu_visible")
        }
        var c = d(".user_popup_btn")
          , f = d(".user_popup_menu")
          , g = !1;
        this.Init = function() {
            E.Init(),
            q.Init(),
            c.onclick = function() {
                g ? b() : a()
            }
            ,
            f.addEventListener("click", function(a) {
                if ("user_popup_entry" == a.target.className)
                    switch (b(),
                    a.target.getAttribute("id")) {
                    case "btn_login":
                        q.Show();
                        break;
                    case "btn_settings":
                        I.Show();
                    }
            }),
            f.addEventListener("transitionend", function(a) {
                a.target == f && (g || (f.style.display = "none"))
            })
        }
    }
      , L = new function() {
        this.Init = function(a) {
            for (var c = 0; c < a.length; c++)
                var d = a[c]
                  , e = new b(d.id,d.name,d.color,d.group);
            s.on("userRename", function(a) {
                if (F.users.has(a.id)) {
                    var b = F.users.get(a.id);
                    w.LogInfo(b.name + " changed his/her name to " + a.name, "rgb(100,100,100)"),
                    b.setName(a.name)
                }
            }),
            s.on("setReady", function(a) {
                F.users.has(a.id) && (F.users.get(a.id).loading_element.style.display = a.state ? "none" : "block")
            })
        }
        ,
        this.Resync = function(a) {
            F.users.forEach(function(a) {
                a.list_element.remove()
            }),
            F.users.clear(),
            this.Init(a)
        }
    }
      , M = new function() {
        this.get = function(a) {
            for (var b, d = a + "=", e = decodeURIComponent(document.cookie), f = e.split(";"), g = 0; g < f.length; g++) {
                for (b = f[g]; " " == b.charAt(0); )
                    b = b.substring(1);
                if (0 == b.indexOf(d))
                    return b.substring(d.length, b.length)
            }
            return !1
        }
        ,
        this.set = function(a, b, c) {
            var e = new Date;
            e.setTime(e.getTime() + 1e3 * (60 * (60 * (24 * c))));
            var d = "expires=" + e.toUTCString();
            document.cookie = a + "=" + b + ";" + d + ";path=/"
        }
    }
      , N = new function() {
        for (var a of f(".tabs")) {
            let b, c = a;
            c.childNodes.forEach(function(a) {
                if (a.hasAttribute("t")) {
                    var e = !a.classList.contains("nohide")
                      , f = d("." + a.getAttribute("t"));
                    f.classList.contains("tab_visible") ? (b = a.getAttribute("t"),
                    c.dispatchEvent(new CustomEvent("tabchange",{
                        detail: b
                    })),
                    a.classList.add("tab_selected")) : e && (f.style.display = "none"),
                    e && f.addEventListener("transitionend", function(a) {
                        a.target == f && (f.classList.contains("tab_visible") || (f.style.display = "none"))
                    }),
                    a.onclick = function() {
                        var f = d("." + b);
                        f.classList.remove("tab_visible");
                        var g = d("." + a.getAttribute("t"));
                        e && (g.style.display = "block"),
                        g.classList.add("tab_visible"),
                        d("div[t=" + b + "]").classList.remove("tab_selected"),
                        b = a.getAttribute("t"),
                        c.dispatchEvent(new CustomEvent("tabchange",{
                            detail: b
                        })),
                        a.classList.add("tab_selected")
                    }
                    ,
                    f.classList.add("tab")
                }
            })
        }
    }
    ;
    v.Start()
}
