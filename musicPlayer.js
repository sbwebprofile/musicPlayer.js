/*!
    musicPlayer.js v0.4.6
    By Amsul (http://amsul.ca)

    Updated: 23 October, 2012

    (c) Amsul Naeem, 2012 - http://amsul.ca
    Licensed under MIT ("expat" flavour) license.
    Hosted on http://github.com/amsul/musicPlayer.js
 */

/*jshint
    browser: true,
    devel: true,
    debug: true,
    asi: true
 */


/* */
(function( $, window, document, undefined ) {
/* */

    'use strict';


    var MusicPlayer = function( playlist, options ) {

        var

            /*
                Globals
            ======================================================================== */

            // merged options
            OPTIONS = $.extend( {}, $.fn.musicPlayer.options, options ),


            // elements
            PLAYLIST = playlist,
            $PLAYLIST = $( PLAYLIST ),
            $PLAYLIST_SONGS = $PLAYLIST.find( '[data-song]' ),

            $PLAYER_CONTAINER = $( OPTIONS.placeInto ),

            $SONG_PLAYING,

            PLAYER_AUDIO,
            $PLAYER_AUDIO,

            $PLAYER_PLAY,
            $PLAYER_PAUSE,
            $PLAYER_REWIND,
            $PLAYER_FORWARD,

            $SEEKER_BAR,
            $SEEKER_PROGRESS,
            $SEEKER_CONTROLLER,

            $TIMESTAMP_START,
            $TIMESTAMP_END,


            // strings
            STRING_TIME_CURRENT = 'Current time',
            STRING_TIME_TOTAL = 'Total duration',

            STRING_AUDIO_TYPE = 'audio/' + OPTIONS.audioType,


            // numbers
            NUMBER_TIME_CURRENT = 0,
            NUMBER_TIME_TOTAL = 0,



            /*
                Private methods
            ======================================================================== */

            _player = {

                // for caching
                cache: {},


                /*
                    Initialize the player
                ======================================================================== */

                init: function() {

                    var
                        // create an audio player
                        $wrappedAudio = _player.createAudio(),

                        // create player seeker
                        $wrapperSeeker = _player.createSeeker(),

                        // create player controls
                        $wrappedControls = _player.createControls(),

                        // create the time stamps
                        $wrappedTimestamps = _player.createTimestamps(),

                        // create a wrapper for the player
                        $wrapper = $( '<section class="' + OPTIONS.classPlayerWrapper + '" />' )


                    // add the stuff to the wrapper
                    $wrapper.append( $wrappedAudio, $wrapperSeeker, $wrappedControls, $wrappedTimestamps )


                    // put the player in the container
                    if ( OPTIONS.placeInto && $PLAYER_CONTAINER.length ) {

                        // insert into dom
                        $PLAYER_CONTAINER.html( $wrapper )

                        // quick reference for the <audio> elem
                        PLAYER_AUDIO = $PLAYER_CONTAINER.find( 'audio' )[ 0 ]
                    }

                    // otherwise
                    else {

                        // place after playlist
                        $PLAYLIST.after( $wrapper )

                        // quick reference for the <audio> elem
                        PLAYER_AUDIO = $PLAYLIST.next().find( 'audio' )[ 0 ]
                    }


                    // bind the songs click event
                    $PLAYLIST_SONGS.on( 'click', _player.onClickSong )
                }, //init



                /*
                    Create a player audio
                ======================================================================== */

                createAudio: function() {

                    // create the audio player
                    $PLAYER_AUDIO       =       $( '<audio controls />' ).

                                                    // bind the events
                                                    on({
                                                        'playing.firstplay': _player.onFirstplay,
                                                        playing: _player.onPlaying,
                                                        pause: _player.onPause,
                                                        timeupdate: _player.onTimeupdate,
                                                        loadedmetadata: _player.onLoadedmetadata,
                                                        durationchange: _player.onDurationchange,
                                                        emptied: _player.onEmptied,
                                                        ended: _player.onEnded,
                                                        error: _player.onError
                                                    }).

                                                    // add the source
                                                    html( '<source type="' + STRING_AUDIO_TYPE + '" />' ).

                                                    // wrap the audio player
                                                    wrap( '<div class="' + OPTIONS.classAudioWrapper + '" style="display:none">' )

                    return $PLAYER_AUDIO.parent()
                }, //createAudio


                /*
                    Create player controls
                ======================================================================== */

                createControls: function() {

                    // create the play button
                    $PLAYER_PLAY        =       createElement( 'a', {
                                                    'data-control': 'play',
                                                    'class': OPTIONS.classControlsPlay
                                                }, OPTIONS.stringPlay ).
                                                on( 'click.controller', _player.onClickControl )

                    // create the pause button
                    $PLAYER_PAUSE       =       createElement( 'a', {
                                                    'data-control': 'pause',
                                                    'class': OPTIONS.classControlsPause,
                                                    'style': 'display:none'
                                                }, OPTIONS.stringPause )

                    // create the rewind button
                    $PLAYER_REWIND      =       createElement( 'a', {
                                                    'data-control': 'rewind',
                                                    'class': OPTIONS.classControlsRewind,
                                                    'style': 'color:lightgrey'
                                                }, OPTIONS.stringRewind )

                    // create the forward button
                    $PLAYER_FORWARD     =       createElement( 'a', {
                                                    'data-control': 'forward',
                                                    'class': OPTIONS.classControlsForward,
                                                    'style': 'color:lightgrey'
                                                }, OPTIONS.stringForward )

                    // return the wrapped controls
                    return $( '<div class="' + OPTIONS.classControlsWrapper + '" />' ).append( $PLAYER_REWIND, $PLAYER_PLAY, $PLAYER_PAUSE, $PLAYER_FORWARD )
                }, //createControls


                /*
                    Create audio seek bar
                ======================================================================== */

                createSeeker: function() {

                    // create the seekbar
                    $SEEKER_BAR         =       createElement( 'div', {
                                                    'class': OPTIONS.classSeekbar,
                                                    'style': 'display:block;min-height:3px' + ( ( OPTIONS.colorSeekbar ) ? ';background:' + OPTIONS.colorSeekbar : '' )
                                                })

                    // create the seekbar progress
                    $SEEKER_PROGRESS    =       createElement( 'div', {
                                                    'class': OPTIONS.classSeekbarProgress,
                                                    'style': 'position:absolute;z-index:10;left:0;top:0;right:100%;bottom:0' + ( ( OPTIONS.colorSeekbarProgress ) ? ';background:' + OPTIONS.colorSeekbarProgress : '' )
                                                })

                    // create the seekbar controller
                    $SEEKER_CONTROLLER  =       createElement( 'a', {
                                                    'class': OPTIONS.classSeekbarController,
                                                    'style': 'position:absolute;z-index:20;left:0;top:0;right:0;bottom:0'
                                                })

                    // return the wrapped seekbar
                    return $( '<div class="' + OPTIONS.classSeekbarWrapper + '" style="position:relative" />' ).append( $SEEKER_BAR, $SEEKER_PROGRESS, $SEEKER_CONTROLLER )
                }, //createSeeker


                /*
                    Create the time stamps
                ======================================================================== */

                createTimestamps: function() {

                    // create the start stamp
                    $TIMESTAMP_START    =       createElement( 'div', {
                                                    'class': OPTIONS.classTimestampStart,
                                                    'style': 'color:lightgrey'
                                                })

                    // create the end stamp
                    $TIMESTAMP_END      =       createElement( 'div', {
                                                    'class': OPTIONS.classTimestampEnd,
                                                    'style': 'color:lightgrey'
                                                })

                    // set the current time
                    _player.setTimestampStart( NUMBER_TIME_CURRENT )

                    // set the total time
                    _player.setTimestampEnd( NUMBER_TIME_TOTAL )


                    // return the wrapped timestamp
                    return $( '<div class="' + OPTIONS.classTimestampWrapper + '" />' ).append( $TIMESTAMP_START, $TIMESTAMP_END )
                }, //createTimestamps




                /*
                    Fire the audio player events
                ======================================================================== */

                onFirstplay: function( event ) {

                    console.log( 'first play', $PLAYER_REWIND )

                    // enable rewind and foward
                    $PLAYER_REWIND.css( 'color', '' ).on( 'click.controller', _player.onClickControl )
                    $PLAYER_FORWARD.css( 'color', '' ).on( 'click.controller', _player.onClickControl )

                    // enable the pause button
                    $PLAYER_PAUSE.on( 'click.controller', _player.onClickControl )

                    // enable the timestamps
                    $TIMESTAMP_START.css( 'color', '' )
                    $TIMESTAMP_END.css( 'color', '' )

                    // bind click events to the seekbar
                    $SEEKER_CONTROLLER.on( 'click.seekcontroller', _player.onClickSeekbar )

                    // switch off the listener
                    $PLAYER_AUDIO.off( '.firstplay' )
                },

                onPlaying: function( event ) {

                    // hide the play button
                    $PLAYER_PLAY.hide()

                    // show the pause button
                    $PLAYER_PAUSE.show()

                    // set the play status
                    _player.setSongPlaying()
                },

                onPause: function( event ) {

                    // hide the pause button
                    $PLAYER_PAUSE.hide()

                    // show the play button
                    $PLAYER_PLAY.show()

                    // set the pause status
                    _player.setSongPaused()
                },

                onTimeupdate: function( event ) {

                    var timeNow = event.target.currentTime

                    // update the start timestamp
                    _player.setTimestampStart( timeNow )

                    // update the seekbar progress
                    $SEEKER_PROGRESS.css( 'width', timeNow / event.target.duration * 100 + '%' )
                },

                onLoadedmetadata: function( event ) {

                    // update the status when a song is ready
                    _player.setTimestampStart( event.target.currentTime )
                    _player.setTimestampEnd( event.target.duration )
                },

                onDurationchange: function( event ) {

                    // if there's a change in duration
                    if ( event.target.duration !== _player.cache.playerDuration ) {

                        // update the end timestamp
                        _player.setTimestampEnd( event.target.duration )

                        // re measure the seekbar click position with duration
                        $SEEKER_CONTROLLER.
                            off( '.seekcontroller' ).
                            on( 'click.seekcontroller', _player.onClickSeekbar )
                    }
                },

                onEnded: function( event ) {

                    _player.setSongStopped()

                    // update the status when a song ends
                    console.log( 'song ended', event )
                },

                onError: function( event ) {

                    // notify when there is an error
                    console.log( 'there was an error loading the song', event )
                },

                onEmptied: function( event ) {

                    // update the timestamps to zero
                    _player.
                        setTimestampStart( 0 ).
                        setTimestampEnd( 0 )
                },


                /*
                    Fire the seekbar click event
                ======================================================================== */

                onClickSeekbar: function( event ) {
                    PLAYER_AUDIO.currentTime = event.offsetX / $SEEKER_BAR[ 0 ].offsetWidth * PLAYER_AUDIO.duration
                },


                /*
                    Handle the player control events
                ======================================================================== */

                onClickControl: function( event ) {

                    // prevent the default
                    event.preventDefault()

                    // do the controller action
                    _player.doControl( event.target )
                },


                /*
                    Fire the click control events
                ======================================================================== */

                doControl: function( button ) {

                    var action = button.dataset.control

                    // if the action is a function
                    if ( typeof _player[ action ] === 'function' ) {

                        // do the action
                        _player[ action ]()
                    }

                    return _player
                },



                /*
                    Click events on a song
                ======================================================================== */

                onClickSong: function( event ) {

                    var
                        song = event.delegateTarget,
                        $song = $( song )

                    console.log( 'click', event )

                    // prevent the default event action
                    event.preventDefault()


                    // if the song is already playing, just return it
                    if ( $SONG_PLAYING && $SONG_PLAYING._songId === song.dataset.action.id ) {
                        return
                    }


                    _player.

                        // play the song
                        play( song.dataset.song ).

                        // set this song as loading
                        setSongLoading( $song )
                },



                /*
                    Set the player timestamps
                ======================================================================== */

                setTimestampStart: function( time ) {

                    // set the text
                    $TIMESTAMP_START.text( formatTime( time ) )

                    return _player
                },

                setTimestampEnd: function( time ) {

                    // set the text
                    $TIMESTAMP_END.text( formatTime( time ) )

                    // cache the duration
                    _player.cache.playerDuration = time

                    return _player
                },


                /*
                    Set a song as loading
                ======================================================================== */

                setSongLoading: function( $song ) {

                    // if a song is already playing
                    if ( $SONG_PLAYING && $SONG_PLAYING.length ) {

                        // clear the previous song state
                        _player.setSongStopped( $SONG_PLAYING )
                    }

                    // set the new song state
                    $SONG_PLAYING   =       $song.

                                                // add the playing class
                                                addClass( OPTIONS.classSongPlaying ).

                                                // add the playing tag
                                                prepend( '<small data-tag="playing" class="' + OPTIONS.classSongPlayingTag + '">' + OPTIONS.stringSongLoading + '</small>' )

                    $SONG_PLAYING._songId = $song[ 0 ].dataset.action.id

                    return _player
                },


                /*
                    Set a song as playing
                ======================================================================== */

                setSongPlaying: function( $song ) {

                    if ( !$song ) {
                        $song = $SONG_PLAYING
                    }

                    $song.
                        find( '[data-tag]' ).
                        html( OPTIONS.stringSongPlaying )

                    return _player
                },


                /*
                    Set a song as paused
                ======================================================================== */

                setSongPaused: function( $song ) {

                    if ( !$song ) {
                        $song = $SONG_PLAYING
                    }

                    $song.
                        find( '[data-tag]' ).
                        html( OPTIONS.stringSongPaused )

                    return _player
                },


                /*
                    Set a song as stopped
                ======================================================================== */

                setSongStopped: function( $song ) {

                    if ( !$song ) {
                        $song = $SONG_PLAYING
                    }

                    $song.

                        // remove the playing class
                        removeClass( OPTIONS.classSongPlaying ).

                        // remove the playing tag
                        find( '[data-tag]' ).remove()

                    return _player
                },



                /*
                    Play a song
                ======================================================================== */

                play: function( source ) {

                    // if there's a source
                    if ( source ) {

                        console.log( source )

                        // reset the player
                        PLAYER_AUDIO.load()

                        // set the source
                        PLAYER_AUDIO.src = source
                    }

                    // if there's a source on the player
                    if ( PLAYER_AUDIO.src ) {

                        // play the source
                        PLAYER_AUDIO.play()
                        return _player
                    }

                    // otherwise, play the first song
                    $PLAYLIST_SONGS.first().trigger( 'click' )

                    return _player
                }, //play


                /*
                    Pause a song
                ======================================================================== */

                pause: function() {

                    // pause the song
                    PLAYER_AUDIO.pause()
                },


                /*
                    Rewind a song
                ======================================================================== */

                rewind: function() {

                    console.log( 'rewinding' )

                    // check if it's greater than the start position
                    if ( PLAYER_AUDIO.currentTime - 5 > 0 ) {
                        PLAYER_AUDIO.currentTime -= 5
                    }

                    // otherwise rewind to start
                    else {
                        PLAYER_AUDIO.currentTime = 0
                    }
                },


                /*
                    Forward a song
                ======================================================================== */

                forward: function() {

                    console.log( 'forwarding' )

                    // check if it's less than the total duration
                    if ( PLAYER_AUDIO.currentTime + 5 < PLAYER_AUDIO.duration ) {
                        PLAYER_AUDIO.currentTime += 5
                    }

                    // otherwise forward to the end
                    else {
                        PLAYER_AUDIO.currentTime = PLAYER_AUDIO.duration
                    }
                }



            }, //_player



            /*
                Public methods
            ======================================================================== */

            player = {

            } //player



        /*
            Initialize and return
        ======================================================================== */

        _player.init()


        // return the player methods
        return player
    } //MusicPlayer




    /*
        Helper functions
    ======================================================================== */

    function createElement( type, options, text ) {

        var
            tagOpen = '<' + type,
            tagClose = '</' + type + '>',
            tagOptions = options ? ' ' : '',
            tagText = text || ''

        // if there are any options
        if ( options.constructor === Object ) {

            for ( var option in options ) {
                if ( options.hasOwnProperty( option ) ) {
                    tagOptions += option + '="' + options[ option ] + '" '
                }
            }
        }

        // close the opening tag
        tagOptions += '>'

        return $( tagOpen + tagOptions + tagText + tagClose )
    } //createElement


    function formatTime( time ) {

        var minutes = Math.floor( time / 60 ),
            seconds = Math.floor( time % 60 )

        // pad the seconds if needed
        if ( seconds < 10 ) { seconds = '0' + seconds }

        return minutes + ':' + seconds
    } //formatTime



    /*
        Extend jQuery
    ======================================================================== */

    $.fn.musicPlayer = function( options ) {
        return this.each( function() {

            if ( !$.data( this, 'music-player' )) {

                $.data(
                    this,
                    'music-player',
                    new MusicPlayer( this, options )
                )
            }

            return this
        })
    }




    /*
        Default options
    ======================================================================== */

    $.fn.musicPlayer.options = {

        // player options
        audioType: 'mp3',


        // classes
        classAudioWrapper: 'wrapper-audio',

        classSongPlaying: 'song-playing',
        classSongPlayingTag: 'song-playing-tag',

        classPlayer: 'music-player',
        classPlayerWrapper: 'wrapper-player',

        classControlsPlay: 'control-play',
        classControlsPause: 'control-pause',
        classControlsRewind: 'control-rewind',
        classControlsForward: 'control-forward',
        classControlsWrapper: 'wrapper-controls',

        classSeekbar: 'seekbar-bar',
        classSeekbarProgress: 'seekbar-progress',
        classSeekbarController: 'seekbar-controller',
        classSeekbarPointer: 'seekbar-pointer',
        classSeekbarWrapper: 'wrapper-seekbar',

        classTimestampStart: 'timestamp-start',
        classTimestampEnd: 'timestamp-end',
        classTimestampWrapper: 'wrapper-timestamps',


        // strings
        stringPlay: 'Play',
        stringPause: 'Pause',
        stringRewind: 'Rewind',
        stringForward: 'Forward',

        stringSongLoading: 'Loading...',
        stringSongPlaying: 'Playing now',
        stringSongPaused: 'Paused',


        // colors
        colorSeekbar: 'lightgrey',
        colorSeekbarProgress: 'red',


        // elements
        placeInto: null
    }


/* */
})( jQuery, window, document );
/* */







