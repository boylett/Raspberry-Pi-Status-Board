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
        $this.Clock.Display.Time.html(moment().format(($this.Config.clock && $this.Config.clock.timeformat) ? $this.Config.clock.timeformat : 'H:mm<\\e\\m>:ss</\\e\\m>'));
        $this.Clock.Display.Info.Date.html(moment().format(($this.Config.clock && $this.Config.clock.dateformat) ? $this.Config.clock.dateformat : 'Do MMM'));
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

        var weather_icon = function(icon)
        {
            switch(icon)
            {
                case '01d': return 'wi-day-sunny';
                case '01n': return 'wi-night-clear';
                case '02d': return 'wi-day-cloudy';
                case '02n': return 'wi-night-alt-cloudy';
                case '03d':
                case '03n': return 'wi-cloud';
                case '04d':
                case '04n': return 'wi-cloudy';
                case '10d': return 'wi-showers';
                case '10n': return 'wi-night-alt-showers';
                case '09d': return 'wi-rain';
                case '09n': return 'wi-night-alt-rain';
                case '11d': return 'wi-day-thunderstorm';
                case '11n': return 'wi-night-alt-thunderstorm';
                case '13d': return 'wi-day-snow';
                case '13n': return 'wi-night-alt-snow';
                case '50d': return 'wi-day-fog';
                case '50n': return 'wi-night-fog';
            }

            return 'wi-na';
        };

        $this.Clock.Display.Info.Weather.Update = function()
        {
            $.ajax(
            {
                data:
                {
                    q: $this.Config.clock.weather.location,
                    appid: $this.Config.clock.weather['api-key']
                },
                dataType: 'json',
                type: 'GET',
                url: 'http://api.openweathermap.org/data/2.5/forecast',
                success: function(data)
                {
                    if(data && data.list)
                    {
                        var icons = [];

                        for(var i = 0; i < ($this.Config.clock.weather.display ? $this.Config.clock.weather.display : 3); i ++)
                        {
                            icons.push('<span class="condition wi ' + weather_icon(data.list[i].weather[0].icon) + '"></span>');
                        }

                        $this.Clock.Display.Info.Weather.find('.condition').remove();
                        $this.Clock.Display.Info.Weather.append(icons.join('<span class="condition wi wi-right"></span>'));
                    }
                }
            });

            if($this.Config.clock.weather.temperature)
            {
                $this.Config.clock.weather.temperature = $this.Config.clock.weather.temperature.trim().toLowerCase();

                $.ajax(
                {
                    data:
                    {
                        q: $this.Config.clock.weather.location,
                        appid: $this.Config.clock.weather['api-key'],
                        units: $this.Config.clock.weather.temperature
                    },
                    dataType: 'json',
                    type: 'GET',
                    url: 'http://api.openweathermap.org/data/2.5/weather',
                    success: function(data)
                    {
                        if(data)
                        {
                            var temp = $this.Clock.Display.Info.Weather.find('.temperature'),
                                units = $this.Config.clock.weather.temperature,
                                degicon = 'wi-degrees',
                                degrees = Math.round(data.main.temp);

                            if(temp.length == 0)
                            {
                                temp = $('<div class="temperature"></div>').prependTo($this.Clock.Display.Info.Weather);
                            }

                            switch(units)
                            {
                                case 'metric':
                                    degicon = 'wi-celsius';
                                    break;

                                case 'imperial':
                                    degicon = 'wi-fahrenheit';
                                    break;
                            }

                            temp.html(degrees + '<i class="wi ' + degicon + '"></i>');
                        }
                    }
                });
            }
        };

        setInterval(
            $this.Clock.Display.Info.Weather.Update, 30 * 60 * 1000);
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
    $this.Dock.MainMenu.Settings = $('<span class="menu-item icon black-tie right settings"><i class="bt bt-gear"></i></span>').appendTo($this.Dock.MainMenu);

    $this.Dock.MainMenu.Back = $('<span class="menu-item icon black-tie back"><i class="bt bt-angle-left"></i></span>')
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

    $this.Dock.MainMenu.Context = $('<span class="menu-item icon black-tie context"><i class="bt bt-bars"></i></span>')
        .appendTo($this.Dock.MainMenu);

    $this.Dock.AppMenu = $('<div class="menu app-menu">').appendTo($this.Dock);
    $this.Dock.AppMenu.Settings = $('<span class="menu-item icon black-tie right settings"><i class="bt bt-gear"></i></span>').appendTo($this.Dock.AppMenu);

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
