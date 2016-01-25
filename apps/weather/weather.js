Springboard.Apps.weather = new App(function($this)
{
    var $config = $.extend(Springboard.Config.apps.weather, Springboard.Config.clock.weather),

    Location = function(location)
    {
        var $loc = this,
            $loading = [false, false];

        $loc.Location = location;

        $loc.Object = $('<div class="location">').appendTo($this.Object);
        $loc.Weather = $('<div class="conditions">').appendTo($loc.Object);
        $loc.Forecast = $('<div class="forecast"><ul></ul></div>').appendTo($loc.Object);

        $loc.Forecast.find('> ul').kinetic();

        $loc.Focus = function()
        {
            $loc.Object.addClass('active');
        };

        $loc.Blur = function()
        {
            $loc.Object.removeClass('active');
        };

        $loc.UpdateForecast = function()
        {
            if($loading[0])
            {
                return $this;
            }

            $loading[0] = true;

            $.ajax(
            {
                data:
                {
                    q: $loc.Location,
                    appid: $config['api-key'],
                    units: $config.units
                },
                dataType: 'json',
                type: 'GET',
                url: 'http://api.openweathermap.org/data/2.5/forecast',
                success: function(data)
                {
                    $loading[0] = false;

                    if(data)
                    {
                        var lastin = null,
                            last = null,
                            lastli = null,
                            list = $loc.Forecast.find('> ul');
                            list.find('> li').remove();

                        for(var i in data.list)
                        {
                            var fore = data.list[i],
                                date = moment(fore.dt * 1000);

                            if(lastin && last && lastli && fore.weather[0].main == last.weather[0].main && fore.main.temp == last.main.temp)
                            {
                                lastli.find('> .time').html
                                (
                                    moment(lastin.dt * 1000).calendar(null,
                                    {
                                        sameDay: 'ha [today]',
                                        nextDay: 'ha [tomorrow]',
                                        nextWeek: 'ha dddd',
                                        lastDay: 'ha [yesterday]',
                                        lastWeek: 'ha [last] dddd',
                                        sameElse: 'ha DD/MM/YYYY'
                                    }) + ' - ' +
                                    moment(fore.dt * 1000).calendar(null,
                                    {
                                        sameDay: 'ha [today]',
                                        nextDay: 'ha [tomorrow]',
                                        nextWeek: 'ha dddd',
                                        lastDay: 'ha [yesterday]',
                                        lastWeek: 'ha [last] dddd',
                                        sameElse: 'ha DD/MM/YYYY'
                                    })
                                );
                            }
                            else
                            {
                                lastin = fore;
                                lastli = $('<li class="forecast-item">')
                                    .appendTo(list)
                                    .html
                                    (
                                        '<span class="time">' + date.calendar(null,
                                        {
                                            sameDay: 'ha [today]',
                                            nextDay: 'ha [tomorrow]',
                                            nextWeek: 'ha dddd',
                                            lastDay: 'ha [yesterday]',
                                            lastWeek: 'ha [last] dddd',
                                            sameElse: 'ha DD/MM/YYYY'
                                        }) + '</span> ' +
                                        '<span class="weather">' +
                                            '<i class="wi ' + weathericon(fore.weather[0].icon) + '"></i> ' +
                                            '<font>' + fore.weather[0].main + '</font>' +
                                        '</span>' +
                                        '<span class="temperature">' + Math.ceil(fore.main.temp) + ' <i class="wi ' + $this.UnitsIcon() + '"></i></span> '
                                    );
                            }

                            last = fore;
                        }
                    }
                }
            });
        };

        $loc.UpdateWeather = function()
        {
            if($loading[1])
            {
                return $this;
            }

            $loading[1] = true;

            $.ajax(
            {
                data:
                {
                    q: $loc.Location,
                    appid: $config['api-key'],
                    units: $config.units
                },
                dataType: 'json',
                type: 'GET',
                url: 'http://api.openweathermap.org/data/2.5/weather',
                success: function(data)
                {
                    $loading[1] = false;

                    if(data)
                    {
                        $loc.Weather.html
                        (
                            '<h1>' + data.name + '</h1>' +
                            '<div class="current-weather">' +
                                '<i class="wi ' + weathericon(data.weather[0].icon) + '"></i> ' + data.weather[0].main +
                                ' &nbsp; ' +
                                '<em>' + Math.ceil(data.main.temp) + ' <i class="wi ' + $this.UnitsIcon() + '"></i></em>' +
                            '</div>'
                        );
                    }
                }
            });
        };
    };

    $this.Class = 'weather';

    $this.Icon = 'wi wi-day-sunny-overcast';
    $this.Name = 'Weather';

    $this.Locations = [];

    $this.UnitsIcon = function()
    {
        var units = $config.units,
            degicon = 'wi-degrees';

        switch(units)
        {
            case 'metric':
                degicon = 'wi-celsius';
                break;

            case 'imperial':
                degicon = 'wi-fahrenheit';
                break;
        }

        return degicon;
    };

    for(var i in $config.locations)
    {
        $this.Locations.push(new Location($config.locations[i]));
    }

    $this.Refresh = 15 * 60 * 1000;

    $this.on('refresh', function()
    {
        for(var i in $this.Locations)
        {
            var loc = $this.Locations[i];

            if(i == 0)
            {
                loc.Focus();
            }

            loc.UpdateForecast();
            loc.UpdateWeather();
        }
    });
});
