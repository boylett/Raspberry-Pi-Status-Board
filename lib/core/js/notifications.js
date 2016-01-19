var Notification = function(options)
{
    var $this = this;

    $this.Options = $.extend(
    {
        click: null,
        color: 'default',
        duration: 5000,
        icon: false,
        label: ''
    }, options);

    $this.Object = $('<div class="notification"><font></font></div>').appendTo(Springboard.Notifications);

    $this.Object.find('> font').html(options.label);

    if($this.Options.icon)
    {
        $('<i class="' + $this.Options.icon + '"></i> ').prependTo($this.Object.addClass('has-icon'));
    }

    if($this.Options.color != 'default')
    {
        $this.Object.addClass('color-' + $this.Options.color);
    }

    $this.Object.on('click', function()
    {
        if($this.Options.click && typeof $this.Options.click == 'function')
        {
            if($this.Options.click.call($this) === false)
            {
                return false;
            }
        }
    });

    $this.Show = function(callback)
    {
        $this.Object.addClass('active');

        if(callback)
        {
            setTimeout(callback, 500);
        }

        return $this;
    };

    $this.Hide = function(callback)
    {
        $this.Object.removeClass('active');

        if(callback)
        {
            setTimeout(callback, 500);
        }

        return $this;
    };

    setTimeout($this.Show, 50);

    if($this.Options.duration)
    {
        setTimeout(function()
        {
            $this.Hide(function()
            {
                $this.Object.remove();
            });
        }, $this.Options.duration);
    }
};
