Springboard.Apps.calendar = new App(function($this)
{
    var $config = Springboard.Config.apps.calendar,
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        today = moment();

    if($config['start-on-monday'])
    {
        days = days.slice(1);
    }
    else
    {
        days = days.slice(0, 7);
    }

    var CalDay = function($moment, $month)
    {
        var $day = this;

        $day.Moment = $moment;

        $day.Object = $('<div class="day">').appendTo($month.Days).addClass(
        [
            $moment.format('dddd').toLowerCase(),
            $moment.format('dddd').match(/^(sat|sun)/i) ? 'weekend' : 'weekday',
            (today.format('d') == $moment.format('d')) ? 'same-day-of-week' : '',
            (today.format('D-M-YYYY') == $moment.format('D-M-YYYY')) ? 'today' : ''
        ].join(' '));

        $day.Label = $('<label>' + $moment.format('D') + '</label>').appendTo($day.Object);
    };

    var CalMonth = function($moment, $cal)
    {
        var $month = this;

        $month.Moment = $moment;

        $month.Object = $('<div class="month">').appendTo($cal.Object).addClass(
        [
            $moment.format('MMMM').toLowerCase(),
            $moment.isLeapYear() ? 'leap-year' : 'common-year'
        ].join(' '));

        $month.Label = $('<div class="label"><label month="' + $moment.format('MMMM') + '"></label></div>').appendTo($month.Object);

        $month.Container = $('<div class="dates">').appendTo($month.Object);

        $month.Weekdays = $('<ul class="days labels">').appendTo($month.Container);

        for(var i in days)
        {
            $('<div class="day' + ((today.format('ddd') == days[i]) ? ' today' : '') + '"><label>' + days[i] + '</label></div>').appendTo($month.Weekdays);
        }

        $month.Days = $('<ul class="days actual-days">').appendTo($month.Container);

        var dim = $moment.daysInMonth();

        for(var d = 0; d < dim; d ++)
        {
            new CalDay(moment($moment.format('YYYY-M-') + (d + 1)), $month);
        }

        var firstday = $month.Days.find('> .day').first(),
            firstmon = $month.Days.find('> .day.monday').first();

        if(!firstday.is(firstmon))
        {
            while(firstmon.index() < (days[0] == 'Mon' ? 7 : 8))
            {
                $('<div class="day filler">').insertBefore(firstday);
            }
        }
    };

    var Calendar = function()
    {
        var $cal = this,
            $css = $('<style type="text/css">').appendTo('head'),
            $moment = moment.apply(window, arguments),
            uqid = 'C' + $moment.format('x');

        $cal.Moment = $moment;

        $cal.Object = $('<div class="calendar" id="' + uqid + '">').appendTo($this.Object);

        $cal.Months =
        {
            List: [],

            Add: function(date)
            {
                var m = new CalMonth(moment(date), $cal);

                $cal.Months.List.push(m);

                for(var i in $cal.Months.List)
                {
                    $cal.Months.List[i].Object.removeClass('active');
                }

                m.Object.addClass('active');

                return m;
            },

            Switch: function(date)
            {
                var m = (date ? moment(date) : moment()).format('YYYY-M'),
                    o = null;

                for(var i in $cal.Months.List)
                {
                    if($cal.Months.List[i].Moment.format('YYYY-M') == m)
                    {
                        o = $cal.Months.List[i];
                        o.Object.addClass('active');
                    }
                    else
                    {
                        $cal.Months.List[i].Object.removeClass('active');
                    }
                }

                if(!o)
                {
                    o = $cal.Months.Add(date);
                }

                $cal.Month = o;

                $this.trigger('resize');

                return o;
            }
        };

        $cal.Month = $cal.Months.Add();

        $this.on('resize', function()
        {
            for(var i in $cal.Months.List)
            {
                var month = $cal.Months.List[i];

                month.Label.find('> label').css(
                {
                    width: month.Label.height(),
                    height: month.Label.width()
                });

                $css.html('.calendar#' + uqid + ' .month.' + month.Moment.format('MMMM').toLowerCase() + ' .days.actual-days > .day { height: ' + (100 / Math.ceil(month.Days.find('> .day').length / 7) )+ '% }');
            }
        });
    };

    $this.Class = 'calendar';

    $this.Icon = 'fa fa-calendar';
    $this.Name = 'Calendar';

    $this.Calendar = new Calendar();

    $this.Object.swipe(
    {
        swipe: function(e, dir)
        {
            var current = $this.Calendar.Month.Moment,
                currentyear = parseInt(current.format('YYYY')),
                currentmonth = parseInt(current.format('M')),
                switchyear = currentyear,
                switchmonth = currentmonth,
                doswitch = false;

            switch(dir)
            {
                case 'left':
                    if(currentmonth == 12)
                    {
                        switchmonth = 1;
                        switchyear ++;
                    }
                    else
                    {
                        switchmonth ++;
                    }

                    doswitch = true;
                    break;

                case 'right':
                    if(currentmonth == 1)
                    {
                        switchmonth = 12;
                        switchyear --;
                    }
                    else
                    {
                        switchmonth --;
                    }

                    doswitch = true;
                    break;
            }

            if(doswitch)
            {
                $this.Calendar.Months.Switch(switchyear + '-' + switchmonth);
            }
        },
        threshhold: 150
    });

    $this.Refresh = 3000;

    $this.on('refresh', function()
    {
        $this.trigger('resize');
    });
});
