Springboard.Apps.trello = new App(function($this)
{
    var $config = Springboard.Config.apps.trello;

    $this.Object.kinetic({ x: true, y: false });

    window.TrelloList = function(id)
    {
        var $list = this;

        $list.ID = id;
        $list.Initial = true;

        $list.Object = $('<div class="list-container" id="L' + id + '">').appendTo($this.Object);
        $list.List = $('<div class="list">').appendTo($list.Object);

        $list.Board = $('<h1>').html('...').appendTo($list.List);
        $list.Name = $('<h2>').html('...').appendTo($list.List);

        Trello.get('lists/' + $list.ID, function(data)
        {
            Trello.get('boards/' + data.idBoard, function(board)
            {
                $list.Board.html(board.name);
            });

            $list.Name.html(data.name);
        });

        $list.CardsContainer = $('<ul class="cards">').appendTo($list.List).kinetic({ x: false, y: true });
        $list.Cards = {};

        $list.Update = function()
        {
            Trello.get('lists/' + $list.ID + '/cards', function(cards)
            {
                var newCards = {};

                for(var i in cards)
                {
                    var card = cards[i];

                    if($list.Cards[card.id])
                    {
                        $list.Cards[card.id].Update(card);
                    }
                    else
                    {
                        $list.Cards[card.id] = new TrelloCard(card);

                        if(!$list.Initial)
                        {
                            $this.New = $this.New + 1;

                            $list.Cards[card.id].Updated = true;
                        }
                    }

                    newCards[card.id] = $list.Cards[card.id];
                }

                $list.CardsContainer.find('> .card').filter(function()
                {
                    return (!newCards[$(this).attr('id').substr(1)]);
                }).remove();

                $list.Cards = newCards;

                for(var i in $list.Cards)
                {
                    $list.Cards[i].Object.appendTo($list.CardsContainer);
                }

                $list.Initial = false;
            });
        };

        $list.Update();
    };

    window.TrelloCard = function(data)
    {
        var $card = this,
            $data = data,
            $silent = true;

        $card.Modified = false;

        $card.Set = function(key)
        {
            switch(key)
            {
                case 'due':
                    $card.Modified = (arguments[1] != $data.due) ? true : $card.Modified;
                    $card.Badges
                        .find('.badge.due')[arguments[1] ? 'addClass' : 'removeClass']('active')
                        .find('> em').html('due ' + (arguments[1] ? moment(arguments[1]).fromNow() : 'tomorrow'));
                    break;

                case 'labels':
                    //
                    break;

                case 'name':
                    $card.Modified = (arguments[1] != $data.name) ? true : $card.Modified;
                    $card.Name[arguments[1] ? 'addClass' : 'removeClass']('active').html(arguments[1]);
                    break;

                case 'badges':
                    switch(arguments[1])
                    {
                        case 'subscribed':
                            $card.Modified = (arguments[2] != $data.badges.subscribed) ? true : $card.Modified;
                            $card.Badges
                                .find('.badge.subscribed')[arguments[2] ? 'addClass' : 'removeClass']('active');
                            break;

                        case 'description':
                            $card.Modified = (arguments[2] != $data.badges.description) ? true : $card.Modified;
                            $card.Badges
                                .find('.badge.description')[arguments[2] ? 'addClass' : 'removeClass']('active');
                            break;

                        case 'attachments':
                            $card.Modified = (arguments[2] != $data.badges.attachments) ? true : $card.Modified;
                            $card.Badges
                                .find('.badge.attachments')[arguments[2] ? 'addClass' : 'removeClass']('active')
                                .find('> em').html(arguments[2] ? arguments[2] : '0');
                            break;

                        case 'comments':
                            $card.Modified = (arguments[2] != $data.badges.comments) ? true : $card.Modified;
                            $card.Badges
                                .find('.badge.comments')[arguments[2] ? 'addClass' : 'removeClass']('active')
                                .find('> em').html(arguments[2] ? arguments[2] : '0');
                            break;

                        case 'checkitems':
                            $card.Modified = (arguments[2] != $data.badges.checkItems) ? true : $card.Modified;
                            $card.Badges
                                .find('.badge.check-items')[arguments[2] ? 'addClass' : 'removeClass']('active')
                                .find('em.total').html(arguments[2] ? arguments[2] : '0');
                            break;

                        case 'checkitemschecked':
                            $card.Modified = (arguments[2] != $data.badges.checkItemsChecked) ? true : $card.Modified;
                            $card.Badges
                                .find('.badge.check-items')[arguments[2] ? 'addClass' : 'removeClass']('active')
                                .find('em.checked').html(arguments[2] ? arguments[2] : '0');
                            break;
                    }
                    break;
            }
        };

        $card.Object = $('<li class="card" id="C' + data.id + '">');

        $card.Name = $('<div class="name">').appendTo($card.Object);
        $card.Badges = $('<div class="badges">').appendTo($card.Object);

        $('<span class="badge subscribed"><i class="bt bt-eye"></i></div>').appendTo($card.Badges);
        $('<span class="badge description"><i class="bt bt-align-left"></i></div>').appendTo($card.Badges);
        $('<span class="badge attachments"><i class="bt bt-paper-clip"></i> <em>0</em></div>').appendTo($card.Badges);
        $('<span class="badge comments"><i class="bt bt-comment"></i> <em>0</em></div>').appendTo($card.Badges);
        $('<span class="badge check-items"><i class="bt bt-checkbox-checked"></i> <em><em class="checked">0</em> / <em class="total">0</em></div>').appendTo($card.Badges);
        $('<span class="badge due"><i class="bt bt-clock"></i> <em>due tomorrow</em></div>').appendTo($card.Badges);

        Object.defineProperty($card, 'Updated',
        {
            get: function()
            {
                return undefined;
            },
            set: function()
            {
                $card.Object[arguments[0] ? 'addClass' : 'removeClass']('updated');
            }
        });

        $card.Update = function(data, silent)
        {
            $silent = !!silent;

            $card.Set('due', data.due);
            $card.Set('name', data.name);
            $card.Set('labels', data.idLabels);

            $card.Set('badges', 'subscribed', data.badges.subscribed);
            $card.Set('badges', 'description', data.badges.description);
            $card.Set('badges', 'attachments', data.badges.attachments);
            $card.Set('badges', 'comments', data.badges.comments);
            $card.Set('badges', 'checkitems', data.badges.checkItems);
            $card.Set('badges', 'checkitemschecked', data.badges.checkItemsChecked);

            if(data.pos != $data.pos)
            {
                $card.Modified = true;
            }

            $data = data;

            if($card.Modified && !$silent)
            {
                $this.New = $this.New + 1;
                $card.Updated = true;
            }
            else
            {
                $card.Updated = false;
            }

            $card.Modified = false;
        };

        $card.Update(data, true);
    };

    $this.Authenticated = false;
    $this.Class = 'trello';

    $this.Icon = 'fa fa-trello';
    $this.Name = 'Trello';

    $this.Authenticate = function(callback)
    {
        $.ajax(
        {
            url: 'https://trello.com/1/client.js',
            data:
            {
                key: $config['api-key']
            },
            type: 'get',
            success: function(js)
            {
                if(js)
                {
                    $('<script type="text/javascript">').appendTo('head')[0].innerHTML = js;

                    Trello.authorize(
                    {
                        expiration: 'never',
                        name: 'Raspberry Pi Status Board',
                        persist: true,
                        type: 'popup',
                        success: function()
                        {
                            $this.Authenticated = true;

                            if(callback)
                            {
                                callback.call($this);
                            }
                        }
                    });
                }
            }
        });
    };

    $this.Lists = {};

    $this.Refresh = 5 * 1000;

    $this.on('refresh', function()
    {
        var ready = function()
        {
            for(var i in $config.lists)
            {
                var id = $config.lists[i];

                if($this.Lists[id])
                {
                    $this.Lists[id].Update();
                }
                else
                {
                    $this.Lists[id] = new TrelloList($config.lists[i]);
                    $this.trigger('resize');
                }
            }

            $this.Initial = false;
        };

        if($this.Authenticated)
        {
            ready();
        }
        else
        {
            $this.Authenticate(function()
            {
                ready();
            });
        }
    });

    $this.on('resize', function()
    {
        var appOff = $this.Object.offset().top,
            windowHeight = $(window).height(),
            dockHeight = Springboard.Dock.outerHeight();

        $this.Object.find('.list-container').each(function()
        {
            $(this)
                .css('max-height', (windowHeight - ($(this).offset().top - appOff)) + 'px')
                .find('> .list > .cards').css(
                {
                    'padding-bottom': '',
                    'max-height': ''
                }).each(function()
                {
                    $(this).css(
                    {
                        'padding-bottom': dockHeight,
                        'max-height': ((windowHeight - ($(this).offset().top - appOff)) - dockHeight) + 'px'
                    });
                });
        });
    });

    $this.on('blur', function()
    {
        $this.Object.find('.card.updated').removeClass('updated');
    });
});
