var App = function(init)
{
    var $this = this,
        $class = '',
        $events = {},
        $icon = 'fa fa-question',
        $new = 0,
        $refresh = function()
        {
            $this.trigger('refresh');

            setTimeout($refresh, $this.Refresh);
        },
        $winWidth = 0,
        $winHeight = 0;

    $this.__showinterval = null

    $this.on = function(ev, callback)
    {
        if(typeof ev == 'string' && ev.indexOf(' ') > -1)
        {
            ev = ev.split(' ');
        }

        if(typeof ev == 'object' && ev.length !== undefined)
        {
            for(var i in ev)
            {
                $this.on(ev[i], callback);
            }

            return $this;
        }

        if(!$events[ev])
        {
            $events[ev] = [];
        }

        $events[ev].push(callback);

        return $this;
    };

    $this.trigger = function(ev, data)
    {
        if(typeof ev == 'string' && ev.indexOf(' ') > -1)
        {
            ev = ev.split(' ');
        }

        if(typeof ev == 'object' && ev.length !== undefined)
        {
            for(var i in ev)
            {
                if($this.trigger(ev[i], data) === false)
                {
                    return false;
                }
            }

            return $this;
        }

        if($events[ev])
        {
            for(var i in $events[ev])
            {
                if($events[ev][i].apply($this, data) === false)
                {
                    return false;
                }
            }
        }

        return $this;
    };

    $this.Debug = function()
    {
        var D = 8;

        if(window.console)
        {
            console.log('Dumping process log for ', $this);

            for(var i in $log)
            {
                console.log($log[i].date, $log[i].entry);
            }
        }

        return 8===D--;
    };

    $this.Object = $('<div class="app">').appendTo(Springboard.AppContainer);

    $this.MenuItem = $('<span class="menu-item"><em><i class="fa fa-question"></i> <b>3</b></em> <font>Application</font></span>')
        .appendTo(Springboard.Dock.AppMenu)
        .on('click', function()
        {
            $this.New = 0;

            Springboard.App = $this;
            Springboard.AppContainer.addClass('active');
            Springboard.Dock.Type = 'main-menu';

            $this.Object.addClass('active');
            $this.trigger('focus activate update resize');

            if(Springboard.__showinterval)
            {
                clearInterval(Springboard.__showinterval);
            }

            if($this.__showinterval)
            {
                clearInterval($this.__showinterval);
            }

            Springboard.__showinterval =
            $this.__showinterval = setTimeout(function()
            {
                $this.trigger('resize');
            }, 510);

            return false;
        });

    $this.Refresh = 5000;

    Object.defineProperties($this,
    {
        Class:
        {
            get: function()
            {
                return $class;
            },
            set: function()
            {
                $this.Object
                    .removeClass($class)
                    .addClass($class = arguments[0]);
            }
        },
        Icon:
        {
            get: function()
            {
                return $icon;
            },
            set: function()
            {
                $this.MenuItem.find('> em > i').attr('class', $icon = arguments[0]);
            }
        },
        New:
        {
            get: function()
            {
                return $new;
            },
            set: function()
            {
                $new = parseInt(arguments[0]);

                if($new > 0)
                {
                    $this.MenuItem.addClass('active').find('> em > b').html($new);

                    if(Springboard.Dock.Type == 'main-menu' && Springboard.App != $this)
                    {
                        new Notification(
                        {
                            color: 'red',
                            icon: $this.Icon,
                            label: $this.Name + ' (' + $new + ')'
                        });
                    }
                }
                else
                {
                    $this.MenuItem.removeClass('active');
                }
            }
        },
        Name:
        {
            get: function()
            {
                return $this.MenuItem.find('> font').text().trim();
            },
            set: function()
            {
                $this.MenuItem.find('> font').html(arguments[0]);
            }
        }
    });

    $(window).on('resize', function()
    {
        var w = $(window).width(),
            h = $(window).height();

        if(w != $winWidth || h != $winHeight)
        {
            $winWidth = w;
            $winHeight = h;

            $this.trigger('resize', [w, h]);
        }
    });

    if(init && typeof init == 'function')
    {
        init.call(Springboard, $this);
        $this.trigger('init');
    }

    $refresh();
};
