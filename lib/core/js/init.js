jQuery(function($)
{
    window.weathericon = function(icon)
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

    $.ajax(
    {
        cache: false,
        dataType: 'json',
        type: 'get',
        url: 'config.json',
        success: function(config)
        {
            if(config && config.apps)
            {
                window.Springboard = new Springboard(config);

                var autoopen = false;

                if(window.location.search.match(/(\?|&)app=([^&]+)/i))
                {
                    autoopen = window.location.search.replace(/(\?|&)app=([^&]+)/i, '$2');
                }

                $.ajax(
                {
                    cache: false,
                    type: 'get',
                    url: 'version',
                    success: function(version)
                    {
                        Springboard.Version = version.trim();

                        if(location.search.match(/(&|\?)updated(=|&|#|$)/i))
                        {
                            new Notification(
                            {
                                duration: 7500,
                                icon: 'fa fa-thumbs-o-up',
                                label: 'Updated to version ' + Springboard.Version
                            });

                            if(history.pushState)
                            {
                                history.pushState({}, document.title, window.location.href.split('?')[0]);
                            }
                        }
                        else
                        {
                            Springboard.Update();
                        }
                    }
                });

                for(var i in config.apps)
                {
                    $('<link rel="stylesheet" href="apps/' + i + '/' + i + '.css?_=' + (new Date * 1) + '" />').appendTo('head');

                    var js = $.ajax(
                    {
                        async: false,
                        cache: false,
                        data:
                        {
                            app: i
                        },
                        url: 'apps/' + i + '/' + i + '.js'
                    });

                    if(js.responseText)
                    {
                        $('<script type="text/javascript"></script>').appendTo('head')[0].innerHTML = js.responseText;
                    }

                    if(Springboard.Apps[i])
                    {
                        Springboard.Apps[i].on('focus', config.apps[i]['dock-hide'] ? function()
                        {
                            Springboard.Dock.Autohide = true;
                        } : function()
                        {
                            Springboard.Dock.Autohide = false;
                        });

                        Springboard.Apps[i].on('blur', function()
                        {
                            Springboard.Dock.Autohide = false;
                        });

                        if(i == autoopen)
                        {
                            Springboard.Apps[i].MenuItem.click();
                        }
                    }
                }
            }
        }
    });
});
