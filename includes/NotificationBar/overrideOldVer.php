<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

class overrideOldVer {
    protected static $instance = null;

    public static function overrideThemeMod() {

        $logicDisplayPage = get_theme_mod('njt_nofi_logic_display_page');
        $listDisplayPage = get_theme_mod('njt_nofi_list_display_page');
        $logicDisplayPost = get_theme_mod('njt_nofi_logic_display_post');
        $listDisplayPost = get_theme_mod('njt_nofi_list_display_post');
    
        $isDisplayHome = get_theme_mod('njt_nofi_homepage') ;
        $isDisplayPage = get_theme_mod('njt_nofi_pages') ;
        $isDisplayPosts = get_theme_mod('njt_nofi_posts') ;
        $isDisplayPageOrPostId = get_theme_mod('njt_nofi_pp_id');
        $arrDisplayPageOrPostId = explode(",",$isDisplayPageOrPostId);
        $excludeDisplayPageOrPostId = get_theme_mod('njt_nofi_exclude_pp_id');

        $oldVerListDisplayPage = array();
        $oldVerListDisplayPost = array();

        $oldVerListExcludePage = array();
        $oldVerListExcludePost = array();

        foreach ($arrDisplayPageOrPostId as &$value) {
           if(get_post_type( $value ) === 'page') {
            $oldVerListDisplayPage[] = $value;
           } else {
            $oldVerListDisplayPost[] = $value;
           }
        }

        foreach ($excludeDisplayPageOrPostId as &$value) {
            if(get_post_type( $value ) === 'page') {
             $oldVerListExcludePage[] = $value;
            } else {
             $oldVerListExcludePost[] = $value;
            }
         }

        if ($isDisplayPage == 'true') {
            $logicDisplayPage = 'dis_all_page';
        } else {
            $logicDisplayPage = 'hide_all_page';
        }

        if ($isDisplayPosts == 'true') {
            $logicDisplayPost = 'dis_all_post';
        } else {
            $logicDisplayPost = 'hide_all_post';
        }

        if (count($oldVerListDisplayPage) > 0) {
            $logicDisplayPage = 'dis_selected_page';
            $mergeDisplayPage = count($oldVerListDisplayPage) > 0 ? $listDisplayPage . ',' .implode($oldVerListDisplayPage) : $listDisplayPage;
        }

        if (count($oldVerListDisplayPost) > 0) {
            $logicDisplayPost = 'dis_selected_post';
            $mergeDisplayPost = count($oldVerListDisplayPost) > 0 ? $listDisplayPost . ',' .implode($oldVerListDisplayPost) : $listDisplayPost;
        }

        if (count($oldVerListExcludePage) > 0) {
            $logicDisplayPage = 'hide_selected_page';
            $mergeDisplayPage = count($oldVerListExcludePage) > 0 ? $listDisplayPage . ',' .implode($oldVerListExcludePage) : $listDisplayPage;
        }

        if (count($oldVerListExcludePost) > 0) {
            $logicDisplayPost = 'hide_selected_post';
            $mergeDisplayPost = count($oldVerListExcludePost) > 0 ? $listDisplayPage . ',' .implode($oldVerListExcludePost) : $listDisplayPage;
        }

        $arrUniqueDisplayPage = implode(',', array_unique(explode(',', $mergeDisplayPage)));
        $arrUniqueDisplayPost = implode(',', array_unique(explode(',', $mergeDisplayPost)));

        set_theme_mod('njt_nofi_logic_display_page', $logicDisplayPage);
        set_theme_mod('njt_nofi_list_display_page', $arrUniqueDisplayPage);

        set_theme_mod('njt_nofi_logic_display_post', $logicDisplayPost);
        set_theme_mod('njt_nofi_list_display_post', $arrUniqueDisplayPost);

    }
}