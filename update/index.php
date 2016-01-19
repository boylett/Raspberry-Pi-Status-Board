<?php

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    $Current = trim(@file_get_contents('../version'));
    $Version = trim(@file_get_contents('https://raw.githubusercontent.com/boylett/Raspberry-Pi-Status-Board/master/version'));

    $Retry = '<br /><a href="../">&laquo; Go Back</a> | <a href="index.php">Try Again</a>';

    @unlink('cache/update.zip');

    if($Current and $Version and preg_match("/^([0-9]+)\.([0-9]+)\.([0-9]+)([a-z])?$/", $Version) and version_compare($Version, $Current) > 0)
    {
        if(@copy('https://github.com/boylett/Raspberry-Pi-Status-Board/archive/master.zip', 'cache/update.zip'))
        {
            $Zip = new ZipArchive();

            if($Zip->open('cache/update.zip') === TRUE)
            {
                try
                {
                    $UpdateDir = 'cache/update-' . $Version . '/';
                    $RepoDir = $UpdateDir . 'Raspberry-Pi-Status-Board-master/';

                    $Zip->extractTo($UpdateDir);
                    $Zip->close();

                    @unlink('cache/update.zip');

                    if(file_exists($RepoDir))
                    {
                        try
                        {
                            function rrmdir($dir)
                            {
                                if(is_dir($dir))
                                {
                                    $objects = scandir($dir);

                                    foreach($objects as $object)
                                    {
                                        if($object != "." && $object != "..")
                                        {
                                            if(is_dir($dir . "/" . $object))
                                            {
                                                rrmdir($dir . "/" . $object);
                                            }
                                            else
                                            {
                                                unlink($dir . "/" . $object);
                                            }
                                        }
                                    }

                                    rmdir($dir);
                                }
                            }

                            function rcopy($src, $dst)
                            {
                                $dir = opendir($src);

                                @mkdir($dst);

                                while(false !== ($file = readdir($dir)))
                                {
                                    if($file != '.' and $file != '..' )
                                    {
                                        if(is_dir($src . '/' . $file))
                                        {
                                            rcopy($src . '/' . $file, $dst . '/' . $file);
                                        }
                                        else
                                        {
                                            copy($src . '/' . $file, $dst . '/' . $file);
                                        }
                                    }
                                }

                                closedir($dir);
                            }

                            @rename('../config.json', '../config-backup.json');
                            @rename('../apps/', '../apps-backup/');

                            rcopy($RepoDir, '../');
                            rrmdir($UpdateDir);

                            rcopy('../apps-backup/', '../apps/');
                            rrmdir('../apps-backup/');

                            @unlink('../config.json');
                            @rename('../config-backup.json', '../config.json');

                            header('Location: ../?updated');
                        }
                        catch(Exception $e)
                        {
                            echo '<h1>' . $e->getMessage() . '</h1>' . $Retry;
                        }
                    }
                    else
                    {
                        echo '<h1>Update files downloaded incorrectly</h1>' . $Retry;
                    }
                }
                catch(Exception $e)
                {
                    echo '<h1>' . $e->getMessage() . '</h1>' . $Retry;
                }
            }
            else
            {
                echo '<h1>Could not read update files</h1>' . $Retry;
            }
        }
        else
        {
            echo '<h1>Could not download update files</h1>' . $Retry;
        }
    }
    else
    {
        header('Location: ../');
    }
