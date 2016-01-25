var Springboard = function($config)
{
    var $this = this,
        $app = undefined,
        $autohidedock = false;

    $this.__showinterval = null;

    Object.defineProperty($this, 'App',
    {
        get: function()
        {
            return $app;
        },
        set: function()
        {
            $app = arguments[0] ? arguments[0] : undefined;
            $this.Object.attr('class', 'springboard' + (($app && $app.Class) ? ' app-' + $app.Class : ''));
        }
    });

    $this.Config = $config;

    $this.Object = $('<div class="springboard">').appendTo('body');
    $this.Notifications = $('<div class="notifications">').appendTo('body');
    $this.Desktop = $('<div class="desktop">').appendTo($this.Object);

    $this.Clock = $('<div class="clock">').appendTo($this.Desktop);
    $this.Clock.Display = $('<div class="clock-display">').appendTo($this.Clock);
    $this.Clock.Display.Time = $('<div class="time">').appendTo($this.Clock.Display);

    $this.Clock.Display.Info = $('<div class="info">').appendTo($this.Clock.Display);
    $this.Clock.Display.Info.Date = $('<div class="date">').appendTo($this.Clock.Display.Info);

    $this.Clock.Display.Time.Tick = function()
    {
        $this.Clock.Display.Time.html(moment().format(($this.Config.clock && $this.Config.clock.timeformat) ? $this.Config.clock.timeformat : 'H:mm[<em>]:ss[</em>]'));

        $this.Clock.Display.Info
            .css('width', $this.Clock.Display.Time.width())
            .Date.html(moment().format(($this.Config.clock && $this.Config.clock.dateformat) ? $this.Config.clock.dateformat : 'Do MMM'));
    };

    setInterval(
        $this.Clock.Display.Time.Tick, 1000);
        $this.Clock.Display.Time.Tick();

    $(window).on('resize', function()
    {
        var height = $(window).height() - $this.Dock.height();

        $this.Clock.css(
        {
            height: height + 'px',
            'line-height': height + 'px'
        });
    });

    if($this.Config.clock.weather && $this.Config.clock.weather.location && $this.Config.clock.weather['api-key'])
    {
        $this.Clock.Display.Info.Weather = $('<div class="weather">').appendTo($this.Clock.Display.Info);

        $this.Clock.Display.Info.Weather.Update = function()
        {
            $.ajax(
            {
                data:
                {
                    q: $this.Config.clock.weather.location,
                    appid: $this.Config.clock.weather['api-key'],
                    units: $this.Config.clock.weather.units
                },
                dataType: 'json',
                type: 'GET',
                url: 'http://api.openweathermap.org/data/2.5/weather',
                success: function(data)
                {
                    if(data)
                    {
                        if(Springboard.Apps.weather && Springboard.Apps.weather.Current)
                        {
                            Springboard.Apps.weather.Current(data);
                        }

                        var units = $this.Config.clock.weather.units,
                            degicon = 'wi-degrees',
                            degrees = Math.round(data.main.temp);

                        switch(units)
                        {
                            case 'metric':
                                degicon = 'wi-celsius';
                                break;

                            case 'imperial':
                                degicon = 'wi-fahrenheit';
                                break;
                        }

                        $this.Clock.Display.Info.Weather.html(
                            '<span class="condition wi ' + weathericon(data.weather[0].icon) + '"></span> ' +
                            '<span class="temperature">' + degrees + '<i class="wi ' + degicon + '"></i></span>');
                    }
                }
            });
        };

        setInterval(
            $this.Clock.Display.Info.Weather.Update, 10 * 60 * 1000);
            $this.Clock.Display.Info.Weather.Update();
    }

    $this.Dock = $('<div class="dock app-menu">').appendTo($this.Object);

    $this.Dock.AutohideTimer = null;
    $this.Dock.AudohideDelay = 3000;

    $this.Dock.Hide = function()
    {
        $this.Dock.addClass('hidden').css('bottom', '-' + $this.Dock.outerHeight() + 'px');
    };

    $this.Dock.Show = function()
    {
        $this.Dock.removeClass('hidden').css('bottom', '0');

        if($this.Dock.AutohideTimer)
        {
            clearTimeout($this.Dock.AutohideTimer);
        }

        if($this.Dock.Autohide)
        {
            $this.Dock.AutohideTimer = setTimeout($this.Dock.Hide, $this.Dock.AudohideDelay);
        }
    };

    Object.defineProperties($this.Dock,
    {
        Autohide:
        {
            get: function()
            {
                return $autohidedock;
            },
            set: function()
            {
                $autohidedock = !!arguments[0];

                if($autohidedock)
                {
                    $this.Dock.AutohideTimer = setTimeout($this.Dock.Hide, $this.Dock.AudohideDelay);
                }
                else if($this.Dock.AutohideTimer)
                {
                    clearTimeout($this.Dock.AutohideTimer);
                    $this.Dock.removeClass('hidden').css('bottom', '0');
                }

                $this.Dock[$autohidedock ? 'addClass' : 'removeClass']('autohide');
            }
        },
        Type:
        {
            get: function()
            {
                return $this.Dock.hasClass('main-menu') ? 'main-menu' : 'app-menu';
            },
            set: function()
            {
                $this.Dock.removeClass('app-menu main-menu').addClass(arguments[0]);
            }
        }
    });

    $this.Dock.MainMenu = $('<div class="menu main-menu">').appendTo($this.Dock);
    $this.Dock.MainMenu.Settings = $('<span class="menu-item icon right settings"><i class="bt bt-gear"></i></span>').appendTo($this.Dock.MainMenu);

    $this.Dock.MainMenu.Back = $('<span class="menu-item icon back"><i class="bt bt-angle-left"></i></span>')
        .appendTo($this.Dock.MainMenu)
        .on('click', function()
        {
            var app = $this.App;

            app.New = 0;

            $this.App = undefined;
            $this.Dock.Type = 'app-menu';

            app.Object.removeClass('active');
            app.trigger('blur deactivate');

            if(app.__showinterval)
            {
                clearInterval(app.__showinterval);
            }

            app.__showinterval =
            $this.__showinterval = setTimeout(function()
            {
                $this.AppContainer.removeClass('active');
            }, 600);

            return false;
        });

    $this.Dock.MainMenu.Context = $('<span class="menu-item icon context"><i class="bt bt-bars"></i></span>')
        .appendTo($this.Dock.MainMenu);

    $this.Dock.AppMenu = $('<div class="menu app-menu">').appendTo($this.Dock);
    $this.Dock.AppMenu.Settings = $('<span class="menu-item icon right settings"><i class="bt bt-gear"></i></span>').appendTo($this.Dock.AppMenu);

    if($this.Config.dock && $this.Config.dock.labels !== undefined && !$this.Config.dock.labels)
    {
        $this.Dock.AppMenu.addClass('icons');
    }

    $this.Dock.MainMenu.Settings.Context =
    $this.Dock.AppMenu.Settings.Context = new ContextMenu(
    {
        button: $($this.Dock.AppMenu.Settings).add($this.Dock.MainMenu.Settings),
        items:
        [
            new ContextMenuItem(
            {
                label: 'Refresh',
                click: function()
                {
                    return location.reload(), false;
                }
            })
        ],
        origin: 'bottom'
    });

    if($this.Config.debug)
    {
        $this.Dock.AppMenu.Settings.Context.Items.Add(new ContextMenuItem(
        {
            label: 'Debug',
            click: function()
            {
                window.location = $this.Config.debug;
                return false;
            }
        }));

        $('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"><' + '/script>').appendTo('body');
    }

    $this.AppContainer = $('<div class="apps">').appendTo($this.Object);
    $this.Apps = {};

    $this.UpdateNotification = null;
    $this.Update = function()
    {
        if(!$this.UpdateNotification)
        {
            $.ajax(
            {
                cache: false,
                type: 'get',
                url: 'https://raw.githubusercontent.com/boylett/Raspberry-Pi-Status-Board/master/version',
                success: function(version)
                {
                    if(version.trim() != Springboard.Version)
                    {
                        var olds = Springboard.Version.split('.').reverse(),
                            news = version.trim().split('.').reverse(),
                            update = false;

                        for(var i in olds)
                        {
                            if(parseInt(news[i]) > parseInt(olds[i]))
                            {
                                update = true;
                            }
                        }

                        if(update)
                        {
                            $this.UpdateNotification = new Notification(
                            {
                                click: function()
                                {
                                    window.location = 'update';
                                },
                                duration: 0,
                                icon: 'fa fa-exclamation-triangle',
                                label: 'Update available! Click here to install'
                            });
                        }
                    }
                }
            });
        }
    };

    setInterval($this.Update, 60 * 60 * 1000);

    $(document).on('mousemove mouseenter mouseleave mouseup mousedown click', function()
    {
        $this.Dock.Show();
    });

    $(window).trigger('resize');

    setInterval(function()
    {
        $(window).trigger('resize');
    }, 1000);
};
