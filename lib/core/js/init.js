jQuery(function($)
{
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
                    }
                }
            }
        }
    });
});
