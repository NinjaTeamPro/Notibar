<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

class overrideOldVer {
    protected static $instance = null;

    public static function overrideThemeMod() {
       $is_override_theme_mod =  get_option('njt_is_override_theme_mod', 'false');

        if($is_override_theme_mod === 'false') {
            $logicDisplayPage = get_theme_mod('njt_nofi_logic_display_page');
            $listDisplayPage = get_theme_mod('njt_nofi_list_display_page');
            $logicDisplayPost = get_theme_mod('njt_nofi_logic_display_post');
            $listDisplayPost = get_theme_mod('njt_nofi_list_display_post');
        
            $isDisplayHome = get_theme_mod('njt_nofi_homepage', 'no_exit_dis_home') ;
            $isDisplayPage = get_theme_mod('njt_nofi_pages', 'no_exit_dis_page') ;
            $isDisplayPosts = get_theme_mod('njt_nofi_posts', 'no_exit_dis_post') ;
            $isDisplayPageOrPostId = get_theme_mod('njt_nofi_pp_id', 'no_exit_pp_id');
            $arrDisplayPageOrPostId = $isDisplayPageOrPostId ? explode(",",$isDisplayPageOrPostId) : [];
            $excludeDisplayPageOrPostId = get_theme_mod('njt_nofi_exclude_pp_id', 'exclude_pp_id');
            $arrExcludeDisplayPageOrPostId = $excludeDisplayPageOrPostId ? explode(",",$excludeDisplayPageOrPostId) : [];
    
           if ($isDisplayHome  === 'no_exit_dis_home'
            && $isDisplayPage === 'no_exit_dis_page' 
            && $isDisplayPosts === 'no_exit_dis_post'
            && $isDisplayPageOrPostId === 'no_exit_pp_id'
            && $excludeDisplayPageOrPostId === 'exclude_pp_id') {
                update_option('njt_is_override_theme_mod', 'true');
                return;
            }

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
    
            foreach ($arrExcludeDisplayPageOrPostId as &$value) {
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
    
            if (count($oldVerListExcludePage) > 0) {
                if ($logicDisplayPage == 'hide_selected_page' ) {
                    $mergeDisplayPage = count($oldVerListExcludePage) > 0 ? $listDisplayPage . ',' . implode(',',$oldVerListExcludePage) : $listDisplayPage;
                } else {
                    $mergeDisplayPage = count($oldVerListExcludePage) > 0 ? implode(',',$oldVerListExcludePage) : $listDisplayPage;
                }
               
                if (!$isDisplayHome) {
                    $mergeDisplayPage = $mergeDisplayPage . ',home_page';
                }
                $logicDisplayPage = 'hide_selected_page';
            }
    
            if (count($oldVerListExcludePost) > 0) {
                if ($logicDisplayPost == 'hide_selected_post') {
                    $mergeDisplayPost = count($oldVerListExcludePost) > 0 ? $listDisplayPost . ',' .implode(',',$oldVerListExcludePost) : $listDisplayPost;
                } else {
                    $mergeDisplayPost = count($oldVerListExcludePost) > 0 ? implode(',',$oldVerListExcludePost) : $listDisplayPost;
                }
                $logicDisplayPost = 'hide_selected_post';
            }

            if (count($oldVerListDisplayPage) > 0) {
                $logicDisplayPage = 'dis_selected_page';
                $mergeDisplayPage = count($oldVerListDisplayPage) > 0 ? $listDisplayPage . ',' .implode(',',$oldVerListDisplayPage) : $listDisplayPage;
                if ($isDisplayHome) {
                    $mergeDisplayPage = $mergeDisplayPage . ',home_page';
                }
            }
    
            if (count($oldVerListDisplayPost) > 0) {
                $logicDisplayPost = 'dis_selected_post';
                $mergeDisplayPost = count($oldVerListDisplayPost) > 0 ? $listDisplayPost . ',' .implode(',',$oldVerListDisplayPost) : $listDisplayPost;
            }
    
            $arrUniqueDisplayPage = implode(',', array_unique(explode(',', $mergeDisplayPage)));
            $arrUniqueDisplayPost = implode(',', array_unique(explode(',', $mergeDisplayPost)));
    
            set_theme_mod('njt_nofi_logic_display_page', $logicDisplayPage);
            set_theme_mod('njt_nofi_list_display_page', $arrUniqueDisplayPage);
    
            set_theme_mod('njt_nofi_logic_display_post', $logicDisplayPost);
            set_theme_mod('njt_nofi_list_display_post', $arrUniqueDisplayPost);

            update_option('njt_is_override_theme_mod', 'true');
        }
    }
}