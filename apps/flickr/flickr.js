Springboard.Apps.flickr = new App(function($this)
{
    var $config = Springboard.Config.apps.flickr;

    $this.Class = 'flickr';

    $this.Icon = 'fa fa-flickr';
    $this.Name = 'Flickr';

    $this.Photo = $('<div class="photo">').appendTo($this.Object);
    $this.Photos = [];

    $.ajax(
    {
        data:
        {
            api_key: $config['api-key'],
            format: 'json',
            method: 'flickr.photos.search',
            privacy_filter: 1,
            tags: $config.tags ? $config.tags.join(',') : 'Landscape'
        },
        dataType: 'jsonp',
        jsonpCallback: 'jsonFlickrApi',
        url: 'https://api.flickr.com/services/rest/',
        success: function(data)
        {
            for(var i in data.photos.photo)
            {
                var photo = data.photos.photo[i],
                    url = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';

                $this.Photos.push(url);
            }

            $this.trigger('refresh');
        }
    });

    $this.Refresh = 10 * 1000;

    $this.on('refresh', function()
    {
        if($this.Photos.length > 0)
        {
            var load = new Image();
                load.onload = function()
                {
                    var photo = $('<div class="photo" style="opacity:0">')
                        .css('background-image', 'url(' + this.src + ')')
                        .appendTo($this.Object)
                        .fadeTo(1500, 1);

                    setTimeout(function()
                    {
                        $this.Photo.remove();
                        $this.Photo = photo;
                    }, 1000);
                };

            load.src = $this.Photos[Math.floor(Math.random() * $this.Photos.length)];
        }
    });
});
