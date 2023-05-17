<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

use stdClass;

class WpPosts {
    protected static $instance = null;

    public static function getInstance() {
		if ( null == self::$instance ) {
			self::$instance = new self();
			self::$instance->doHooks();
		}

		return self::$instance;
	}

    private function doHooks() {
        add_action( 'wp_ajax_njt_nofi_query_post', array( $this, 'njt_nofi_query_post' ) );
    }

    public static function get_list_posts() {
        $args = array(
            'post_type' => array( 'post', 'page' ),
            'posts_per_page' => 20
        );
        $posts = get_posts( $args );
        $list_posts = wp_list_pluck( $posts, 'post_title', 'ID');
        return $list_posts;
    }

    public static function get_list_posts_selected() {
        $DisplayPageOrPostId = get_theme_mod('njt_nofi_pp_id');
        $args = array(
            'post_type' => array( 'post', 'page' ),
            'post__in'  => explode(',', $DisplayPageOrPostId),
            'orderby'   => 'post__in',
            'posts_per_page' => -1,
        );
        $posts = get_posts( $args );
        $list_posts       = array();
        foreach ( $posts as $post ) {
            $post_item       = new stdClass();
            $post_item->id   = (string) $post->ID;
            $post_item->text = get_the_title( $post );
            $list_posts[]    = $post_item;
        }
        return $list_posts;
    }

    public function njt_nofi_query_post() {
      if ( isset( $_POST ) ) {
        $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( $_POST['nonce'] ) : null;
  
        if ( ! wp_verify_nonce( $nonce, 'njt-nofi-cus-control-select2' ) ) {
          wp_send_json_error( array( 'status' => 'Wrong nonce validate!' ) );
          exit();
        }
        $size          = 20;
        $page           = isset( $_POST['page'] ) ? sanitize_text_field( $_POST['page'] ) : 1;
		$offset        = ( +$page - 1 ) * $size;
        $search_string = isset( $_POST['search'] ) ? sanitize_text_field( $_POST['search'] ) : null;

        $args = array(
            'post_type' => array( 'post', 'page' ),
            's'              => $search_string,
            'posts_per_page' => $size + 1,
			'offset'         => $offset,
            'orderby'        => 'post_title',
			'order'          => 'ASC',
        );
        $posts = get_posts( $args );
        $list_posts       = array();
        foreach ( $posts as $post ) {
            $post_item       = new stdClass();
            $post_item->id   = (string) $post->ID;
            $post_item->text = get_the_title( $post );
            $list_posts[]    = $post_item;
        }

        wp_send_json_success(
            array( 
                'results' => $list_posts,
                'count_filtered' => count($list_posts)
            )
        );
      }
      wp_send_json_error( array( 'message' => 'Update fail!' ) );
    }
}