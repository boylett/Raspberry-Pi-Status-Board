var ContextMenuItem = function(options)
{
    var $this = this;

    $this.Object = $('<a><font></font></a>').on('click', function(e)
    {
        if($(this).data('click'))
        {
            $(this).data('click').call(this, e);
        }

        $(this).closest('.context-menu.active').removeClass('active');

        return false;
    });

    if(options && typeof options == 'object')
    {
        if(options.label)
        {
            $this.Object.find('> font').html(options.label);
        }

        if(options.click)
        {
            $this.Object.data('click', options.click);
        }

        if(options.icon)
        {
            $this.Object.prepend('<i class="' + options.icon + '"></i> ');
        }
    }
},

ContextMenu = function(options)
{
    var $this = this;

    $this.Object = $('<div class="context-menu">');

    $this.Items =
    {
        List: [],

        Add: function(menuitem)
        {
            $this.Items.List.push(menuitem);
            menuitem.Object.appendTo($this.Object);

            return $this.Items;
        },

        Remove: function(menuitem)
        {
            var list = [];

            for(var i in $this.Items.List)
            {
                if($this.Items.List[i] != menuitem)
                {
                    list.push($this.Items.List[i]);
                }
            }

            menuitem.Object.detach();

            $this.Items.List = list;

            return $this.Items;
        }
    };

    $('body').on('click', function()
    {
        $this.Object.removeClass('active');
    });

    if(options && typeof options == 'object')
    {
        if(options.button)
        {
            $(options.button).on('click', function()
            {
                $this.Object.toggleClass('active').removeClass('origin-top origin-bottom').appendTo('body');

                if($this.Object.hasClass('active'))
                {
                    var off = $(this).offset(),
                        left = off.left + $(this).width() / 2,
                        top = off.top;

                    if(options.origin && options.origin.match(/b(ottom)?/i))
                    {
                        $this.Object.addClass('origin-bottom').css(
                        {
                            bottom: $(window).height() - top,
                            left: left
                        });
                    }
                    else
                    {
                        top += $(this).height();

                        $this.Object.addClass('origin-top').css(
                        {
                            top: top,
                            left: left
                        });
                    }
                }

                return false;
            });
        }

        if(options.items && typeof options.items == 'object')
        {
            for(var i in options.items)
            {
                $this.Items.Add(options.items[i]);
            }
        }
    }
};
